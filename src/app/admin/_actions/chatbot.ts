"use server";

import { intentId, IntentSchema } from "@/lib/admin-schemas";
import * as z from "zod";
import { adminAction, assertDb, requireRow, ActionError, invalidate, type ActionResult } from "@/lib/server/admin-action";
import { singleLine } from "@/lib/validation";
import { match, prepareIntents, scoreIntents } from "@/lib/chatbot/matcher";
import { getKnowledge } from "@/lib/chatbot/repository";

/** "Etiket TR | Label EN | /adres" per line. */

const saveIntentImpl = adminAction({
  schema: IntentSchema,
  audit: { action: "save", entity: "chat_intent" },
  run: async (v, { db }) => {
    if (v.patterns_tr.length + v.patterns_en.length === 0) {
      throw new ActionError("En az bir soru kalıbı girin.", { patterns_tr: ["En az bir soru kalıbı girin."] });
    }
    if (v.follow_ups.includes(v.id)) {
      throw new ActionError("Bir konu kendisini takip sorusu olarak gösteremez.", { follow_ups: ["Kendisini içeremez."] });
    }
    const intent = {
      id: v.id,
      category: v.category,
      priority: v.priority,
      title_tr: v.title_tr,
      title_en: v.title_en,
      answer_tr: v.answer_tr,
      answer_en: v.answer_en,
      keywords: v.keywords.map((k) => k.toLocaleLowerCase("tr")),
      links: v.links,
      follow_ups: v.follow_ups,
      is_active: v.is_active,
    };
    const patterns = [
      ...v.patterns_tr.map((pattern) => ({ lang: "tr", pattern })),
      ...v.patterns_en.map((pattern) => ({ lang: "en", pattern })),
    ];
    const id = assertDb(await db.rpc("admin_save_intent", { p_intent: intent, p_patterns: patterns, p_original_id: v.original_id }));
    invalidate("chat");
    return { entityId: String(id), message: "Soru-cevap kaydedildi.", data: { id: String(id) } };
  },
});

const deleteIntentImpl = adminAction({
  schema: z.object({ id: intentId }),
  audit: { action: "delete", entity: "chat_intent" },
  run: async ({ id }, { db }) => {
    const deleted = requireRow(await db.from("chat_intents").delete().eq("id", id).select("id"));
    if (!deleted.length) throw new ActionError("Kayıt bulunamadı.");
    invalidate("chat");
    return { entityId: id, message: "Soru-cevap silindi." };
  },
});

const clearLogsImpl = adminAction({
  schema: z.object({ scope: z.enum(["all", "answered", "older_than_30_days"]) }),
  audit: { action: "clear_logs", entity: "chat_logs" },
  run: async ({ scope }, { db }) => {
    let query = db.from("chat_logs").delete();
    if (scope === "answered") query = query.in("result_type", ["answer", "option"]);
    else if (scope === "older_than_30_days") query = query.lt("created_at", new Date(Date.now() - 30 * 864e5).toISOString());
    else query = query.gte("id", 0);
    assertDb(await query);
    return { message: "Kayıtlar temizlendi.", details: { scope } };
  },
});

export interface MatchPreview {
  result: "answer" | "clarify" | "fallback";
  top: { id: string; title: string; score: number }[];
}

const previewImpl = adminAction({
  schema: z.object({ message: singleLine(300, 1) }),
  audit: false,
  run: async ({ message }) => {
    const { intents } = await getKnowledge();
    const prepared = prepareIntents(intents);
    const result = match(message, prepared);
    const top = scoreIntents(message, prepared)
      .slice(0, 5)
      .map((s) => ({ id: s.intent.id, title: s.intent.title.tr, score: Math.round(s.score * 100) / 100 }));
    return { message: "Test tamamlandı.", data: { result: result.type, top } satisfies MatchPreview };
  },
});

type R<T = undefined> = ActionResult<T> | undefined;
export async function saveIntent(prev: R<{ id: string }>, fd: FormData) { return saveIntentImpl(prev, fd); }
export async function deleteIntent(prev: R, fd: FormData) { return deleteIntentImpl(prev, fd); }
export async function clearChatLogs(prev: R, fd: FormData) { return clearLogsImpl(prev, fd); }
export async function previewMatch(prev: R<MatchPreview>, fd: FormData) { return previewImpl(prev, fd); }
