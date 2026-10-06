import { after } from "next/server";
import { match } from "@/lib/chatbot/matcher";
import { getKnowledge, isChatRateLimited, logChat } from "@/lib/chatbot/repository";
import { clientIpHash } from "@/lib/server/request";
import type { ChatRequest, ChatResponse, Intent, IntentOption, Lang } from "@/lib/chatbot/types";

const MAX_MESSAGE_LENGTH = 300;
const FALLBACK_SUGGESTIONS = 4;

const MESSAGES = {
  clarifyMany: {
    tr: "Sorunuz birkaç konuya benziyor. Hangisini sormak istediniz?",
    en: "Your question matches a few topics. Which one did you mean?",
  },
  clarifyOne: {
    tr: "Bunu mu sormak istediniz?",
    en: "Did you mean this?",
  },
  fallback: {
    tr: "Bunu tam anlayamadım. Şu sorulardan birini deneyebilirsiniz:",
    en: "I couldn't quite get that. You could try one of these:",
  },
} satisfies Record<string, Record<Lang, string>>;

function toOption(intent: Intent, lang: Lang): IntentOption {
  return { id: intent.id, title: intent.title[lang] };
}

function answerFor(intent: Intent, intents: Intent[], lang: Lang): ChatResponse {
  const byId = new Map(intents.map((i) => [i.id, i]));
  return {
    type: "answer",
    intentId: intent.id,
    answer: intent.answer[lang],
    links: intent.links.map((l) => ({ label: l.label[lang], href: l.href })),
    followUps: intent.followUps
      .map((id) => byId.get(id))
      .filter((i): i is Intent => !!i)
      .map((i) => toOption(i, lang)),
  };
}

function popularOptions(intents: Intent[], lang: Lang): IntentOption[] {
  return [...intents]
    .filter((i) => i.category !== "smalltalk")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, FALLBACK_SUGGESTIONS)
    .map((i) => toOption(i, lang));
}

const MAX_BODY_BYTES = 2_000;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Request too large" }, { status: 413 });

  let body: ChatRequest;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const ipHash = await clientIpHash();
  if (await isChatRateLimited(ipHash)) {
    return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const lang: Lang = body.lang === "en" ? "en" : "tr";
  const { intents, prepared } = await getKnowledge();

  // A suggestion chip was clicked: answer that intent directly.
  if (body.intentId !== undefined) {
    if (typeof body.intentId !== "string" || !/^[a-z0-9-]{1,64}$/.test(body.intentId)) {
      return Response.json({ error: "Invalid intent" }, { status: 400 });
    }
    const intent = intents.find((i) => i.id === body.intentId);
    if (!intent) return Response.json({ error: "Unknown intent" }, { status: 404 });
    after(() => logChat({ lang, ipHash, query: intent.title[lang], resultType: "option", intentId: intent.id }));
    return Response.json(answerFor(intent, intents, lang));
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` }, { status: 400 });
  }

  const result = match(message, prepared);
  let response: ChatResponse;

  if (result.type === "answer") {
    response = answerFor(result.intent, intents, lang);
    after(() => logChat({ lang, ipHash, query: message, resultType: "answer", intentId: result.intent.id, score: result.score }));
  } else if (result.type === "clarify") {
    const options = result.candidates.map((c) => toOption(c.intent, lang));
    response = {
      type: "clarify",
      message: (options.length === 1 ? MESSAGES.clarifyOne : MESSAGES.clarifyMany)[lang],
      options,
    };
    after(() =>
      logChat({
        lang,
        ipHash,
        query: message,
        resultType: "clarify",
        score: result.candidates[0]?.score,
        candidates: result.candidates.map((c) => c.intent.id),
      }),
    );
  } else {
    response = { type: "fallback", message: MESSAGES.fallback[lang], options: popularOptions(intents, lang) };
    after(() => logChat({ lang, ipHash, query: message, resultType: "fallback" }));
  }

  return Response.json(response);
}
