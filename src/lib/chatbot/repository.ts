import "server-only";
import { unstable_cache } from "next/cache";
import localKnowledge from "./knowledge.json";
import { prepareIntents } from "./matcher";
import { createPublicClient, createServiceClient } from "@/lib/server/supabase";
import { serverEnv } from "@/lib/server/env";
import type { Intent, IntentLink, Lang } from "./types";

export const CHAT_TAG = "chat";

/** Requests per IP per window before /api/chat answers 429. */
export const CHAT_RATE_LIMIT = { max: 30, windowMs: 60_000 };

interface IntentRow {
  id: string;
  category: string;
  priority: number;
  title_tr: string;
  title_en: string;
  answer_tr: string;
  answer_en: string;
  keywords: string[];
  links: IntentLink[];
  follow_ups: string[];
  chat_patterns: { lang: Lang; pattern: string }[];
}

function fromRow(row: IntentRow): Intent {
  return {
    id: row.id,
    category: row.category,
    priority: row.priority,
    title: { tr: row.title_tr, en: row.title_en },
    answer: { tr: row.answer_tr, en: row.answer_en },
    patterns: {
      tr: row.chat_patterns.filter((p) => p.lang === "tr").map((p) => p.pattern),
      en: row.chat_patterns.filter((p) => p.lang === "en").map((p) => p.pattern),
    },
    keywords: row.keywords,
    links: row.links,
    followUps: row.follow_ups,
  };
}

async function fetchIntents(): Promise<Intent[]> {
  if (!serverEnv.isConfigured) return localKnowledge.intents as Intent[];

  const { data, error } = await createPublicClient()
    .from("chat_intents")
    .select("id, category, priority, title_tr, title_en, answer_tr, answer_en, keywords, links, follow_ups, chat_patterns(lang, pattern)")
    .eq("is_active", true);

  if (error) {
    console.error("[chatbot] Supabase read failed, using bundled knowledge:", error.message);
    return localKnowledge.intents as Intent[];
  }
  return (data as IntentRow[]).map(fromRow);
}

const getIntents = unstable_cache(fetchIntents, ["chat-intents-v1"], { tags: [CHAT_TAG], revalidate: 3600 });

let prepared: { source: Intent[]; value: ReturnType<typeof prepareIntents> } | null = null;

export async function getKnowledge() {
  const intents = await getIntents();
  // Tokenising ~800 patterns is cheap but not free; reuse it while the data is unchanged.
  if (prepared?.source !== intents) prepared = { source: intents, value: prepareIntents(intents) };
  return { intents, prepared: prepared.value };
}

export interface ChatLogEntry {
  lang: Lang;
  query: string;
  resultType: "answer" | "clarify" | "fallback" | "option";
  ipHash: string;
  intentId?: string;
  score?: number;
  candidates?: string[];
}

export async function logChat(entry: ChatLogEntry) {
  if (!serverEnv.isConfigured) return;
  const { error } = await createServiceClient().from("chat_logs").insert({
    lang: entry.lang,
    query: entry.query,
    result_type: entry.resultType,
    intent_id: entry.intentId ?? null,
    score: entry.score ?? null,
    candidates: entry.candidates ?? [],
    ip_hash: entry.ipHash,
  });
  if (error) console.error("[chatbot] Failed to write chat log:", error.message);
}

/** True when this IP already sent too many questions in the current window. */
export async function isChatRateLimited(ipHash: string): Promise<boolean> {
  if (!serverEnv.isConfigured) return false;
  const since = new Date(Date.now() - CHAT_RATE_LIMIT.windowMs).toISOString();
  const { count, error } = await createServiceClient()
    .from("chat_logs")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) {
    console.error("[chatbot] Rate limit check failed:", error.message);
    return false;
  }
  return (count ?? 0) >= CHAT_RATE_LIMIT.max;
}
