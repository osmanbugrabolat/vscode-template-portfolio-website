import { requireAdmin } from "@/lib/server/auth";
import ChatbotAdmin, { type AdminIntent, type ChatLogRow, type UnansweredRow } from "./ChatbotAdmin";

export const metadata = { title: "BuğrAI" };

export default async function ChatbotPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { db } = await requireAdmin();
  const [intents, unanswered, logs, { tab }] = await Promise.all([
    db
      .from("chat_intents")
      .select("id, category, priority, title_tr, title_en, answer_tr, answer_en, keywords, links, follow_ups, is_active, chat_patterns(lang, pattern)")
      .order("category")
      .order("priority", { ascending: false }),
    db.from("chat_unanswered").select("*").limit(200),
    db.from("chat_logs").select("id, created_at, lang, query, result_type, intent_id, score, candidates").order("created_at", { ascending: false }).limit(200),
    searchParams,
  ]);
  if (intents.error) throw new Error("BuğrAI verisi yüklenemedi.");

  return (
    <div className="adm-page adm-page-wide">
      <ChatbotAdmin
        intents={intents.data as AdminIntent[]}
        unanswered={(unanswered.data ?? []) as UnansweredRow[]}
        logs={(logs.data ?? []) as ChatLogRow[]}
        initialTab={tab === "unanswered" || tab === "logs" || tab === "test" ? tab : "intents"}
      />
    </div>
  );
}
