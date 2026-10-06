import type { Intent } from "./types";

/** A clear winner at or above this score is answered directly. */
const ANSWER_MIN = 0.6;
/** The winner must lead the runner-up by this much to skip the "which one?" step. */
const ANSWER_GAP = 0.12;
/** Below this score an intent is not considered related at all. */
const RELATED_MIN = 0.34;
/** Intents within this distance of the best score are offered as options. */
const OPTION_WINDOW = 0.22;
const MAX_OPTIONS = 4;

const CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
};

// Words that carry no meaning on their own. Both languages are checked because
// visitors often mix them regardless of the selected UI language.
const STOPWORDS = new Set([
  // tr
  "acaba", "ama", "ben", "bana", "beni", "benim", "bir", "biraz", "bu", "bunu", "da", "de",
  "diye", "gibi", "hakkinda", "hangi", "hangisi", "icin", "ile", "ki", "kim", "mi", "mu",
  "misin", "musun", "nasil", "ne", "neden", "nedir", "neler", "nerede", "nereden", "o", "olan",
  "sen", "sana", "seni", "senin", "siz", "size", "sizin", "su", "ve", "veya", "var", "midir",
  "mudur", "kac", "lutfen", "bilgi", "soyle", "anlat", "anlatir", "acikla", "biraz",
  // en
  "a", "about", "an", "and", "any", "are", "can", "could", "did", "do", "does", "for", "have",
  "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "please", "tell", "the", "to",
  "what", "whats", "where", "which", "who", "why", "with", "you", "your", "yours", "know",
  "some", "there", "this", "that", "was", "were", "would", "be",
]);

export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (ch) => CHAR_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/(?<![a-z0-9])\.|\.(?![a-z0-9])/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  const all = normalize(text).split(" ").filter(Boolean);
  const meaningful = all.filter((t) => !STOPWORDS.has(t));
  // "Kimsin?" style questions are entirely stopwords; keep them rather than nothing.
  return meaningful.length > 0 ? meaningful : all;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 0..1 similarity of two words, tolerant of Turkish suffixes and typos. */
export function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (short.length < 3) return 0;

  // Suffix tolerance: "proje" ~ "projelerin", "universite" ~ "universitesinde".
  if (long.startsWith(short)) return short.length >= 4 ? 0.92 : 0.6;

  if (short.length < 4) return 0;
  // Typo tolerance: "univrsite" ~ "universite". Compare against the stem-length
  // prefix too, so a typo inside a suffixed word still matches.
  const full = 1 - levenshtein(a, b) / long.length;
  const prefix = 1 - levenshtein(short, long.slice(0, short.length + 1)) / (short.length + 1);
  const ratio = Math.max(full, prefix);
  return ratio >= 0.75 ? ratio * 0.88 : 0;
}

function bestMatch(token: string, candidates: string[]): number {
  let best = 0;
  for (const c of candidates) {
    const s = tokenSimilarity(token, c);
    if (s > best) best = s;
    if (best === 1) break;
  }
  return best;
}

/** Dice-style overlap: both "how much of the question is covered" and "how much of the pattern". */
function phraseScore(query: string[], pattern: string[]): number {
  if (query.length === 0 || pattern.length === 0) return 0;
  const queryCoverage = query.reduce((sum, t) => sum + bestMatch(t, pattern), 0) / query.length;
  if (queryCoverage === 0) return 0;
  const patternCoverage = pattern.reduce((sum, t) => sum + bestMatch(t, query), 0) / pattern.length;
  return (2 * queryCoverage * patternCoverage) / (queryCoverage + patternCoverage);
}

interface PreparedIntent {
  intent: Intent;
  normalizedPatterns: Set<string>;
  patternTokens: string[][];
  keywordTokens: string[];
}

export interface ScoredIntent {
  intent: Intent;
  score: number;
}

export type MatchResult =
  | { type: "answer"; intent: Intent; score: number }
  | { type: "clarify"; candidates: ScoredIntent[] }
  | { type: "fallback"; candidates: ScoredIntent[] };

export function prepareIntents(intents: Intent[]): PreparedIntent[] {
  return intents.map((intent) => {
    const patterns = [...intent.patterns.tr, ...intent.patterns.en, intent.title.tr, intent.title.en];
    return {
      intent,
      normalizedPatterns: new Set(patterns.map(normalize)),
      patternTokens: patterns.map(tokenize).filter((t) => t.length > 0),
      keywordTokens: intent.keywords.flatMap(tokenize),
    };
  });
}

export function scoreIntents(query: string, prepared: PreparedIntent[]): ScoredIntent[] {
  const normalizedQuery = normalize(query);
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return prepared
    .map(({ intent, normalizedPatterns, patternTokens, keywordTokens }) => {
      if (normalizedPatterns.has(normalizedQuery)) return { intent, score: 1 };

      let best = 0;
      for (const tokens of patternTokens) {
        const s = phraseScore(queryTokens, tokens);
        if (s > best) best = s;
      }

      // Keywords lift an intent when the wording is unusual but the topic is clear.
      const keywordHits = keywordTokens.length
        ? queryTokens.filter((t) => bestMatch(t, keywordTokens) >= 0.8).length / queryTokens.length
        : 0;
      const score = Math.min(1, Math.max(best, keywordHits * 0.7) + keywordHits * 0.15);
      return { intent, score };
    })
    .sort((a, b) => b.score - a.score || b.intent.priority - a.intent.priority);
}

export function match(query: string, prepared: PreparedIntent[]): MatchResult {
  const scored = scoreIntents(query, prepared);
  const [top, second] = scored;

  if (!top || top.score < RELATED_MIN) {
    return { type: "fallback", candidates: [] };
  }

  const runnerUp = second?.score ?? 0;
  if (top.score >= ANSWER_MIN && top.score - runnerUp >= ANSWER_GAP) {
    return { type: "answer", intent: top.intent, score: top.score };
  }

  const candidates = scored
    .filter((s) => s.score >= RELATED_MIN && s.score >= top.score - OPTION_WINDOW)
    .slice(0, MAX_OPTIONS);

  // A single weak candidate is still worth confirming ("Did you mean…?").
  return { type: "clarify", candidates };
}
