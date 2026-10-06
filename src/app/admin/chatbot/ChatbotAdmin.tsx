"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VscAdd, VscBeaker, VscCircleSlash, VscHistory, VscQuestion, VscRobot, VscSearch, VscTrash, VscInfo, VscPlay } from "react-icons/vsc";
import type { IntentLink } from "@/lib/chatbot/types";
import { clearChatLogs, deleteIntent, previewMatch, saveIntent } from "../_actions/chatbot";
import { DeleteButton, FormError, LangTabs, PageHeader, SelectField, SubmitButton, TextAreaField, TextField, Toggle, useAdminAction } from "../_components/ui";
import { formatDate } from "../_components/labels";

export interface AdminIntent {
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
  is_active: boolean;
  chat_patterns: { lang: "tr" | "en"; pattern: string }[];
}

export interface UnansweredRow {
  query: string;
  times_asked: number;
  last_asked: string;
  result_types: string[];
}

export interface ChatLogRow {
  id: number;
  created_at: string;
  lang: string;
  query: string;
  result_type: string;
  intent_id: string | null;
  score: number | null;
  candidates: string[];
}

type Tab = "intents" | "unanswered" | "logs" | "test";

const RESULT_LABEL: Record<string, { label: string; cls: string }> = {
  answer: { label: "Cevaplandı", cls: "adm-badge-success" },
  option: { label: "Seçenekten", cls: "adm-badge-accent" },
  clarify: { label: "Seçenek sunuldu", cls: "adm-badge-warning" },
  fallback: { label: "Anlaşılmadı", cls: "adm-badge-danger" },
};

export default function ChatbotAdmin({ intents, unanswered, logs, initialTab }: { intents: AdminIntent[]; unanswered: UnansweredRow[]; logs: ChatLogRow[]; initialTab: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [seedPattern, setSeedPattern] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const editorRef = useRef<HTMLElement>(null);
  const open = (id: string | "new") => {
    setSelected(id);
    if (window.matchMedia("(max-width: 1100px)").matches) {
      requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const q = query.trim().toLocaleLowerCase("tr");
  const filtered = useMemo(
    () =>
      intents.filter(
        (i) =>
          !q ||
          i.id.includes(q) ||
          i.title_tr.toLocaleLowerCase("tr").includes(q) ||
          i.category.includes(q) ||
          i.chat_patterns.some((p) => p.pattern.toLocaleLowerCase("tr").includes(q)),
      ),
    [intents, q],
  );
  const categories = [...new Set(intents.map((i) => i.category))].sort();
  const current = selected && selected !== "new" ? intents.find((i) => i.id === selected) : undefined;

  const switchTab = (t: Tab) => {
    setTab(t);
    router.replace(t === "intents" ? "/admin/chatbot" : `/admin/chatbot?tab=${t}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="BuğrAI Soru ve Cevaplar"
        icon={<VscRobot aria-hidden />}
        description="BuğrAI yapay zeka kullanmaz: ziyaretçinin yazdığını buradaki soru kalıplarıyla karşılaştırır. Ne kadar çeşitli kalıp eklerseniz o kadar iyi anlar."
      />

      <div className="adm-tabs" role="tablist">
        {(
          [
            ["intents", "Konular", <VscRobot key="i" />, intents.length],
            ["unanswered", "Cevapsız sorular", <VscQuestion key="u" />, unanswered.length],
            ["logs", "Son sorular", <VscHistory key="l" />, logs.length],
            ["test", "Test et", <VscBeaker key="t" />, null],
          ] as const
        ).map(([t, label, icon, count]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="adm-tab" onClick={() => switchTab(t)}>
            {icon}
            {label}
            {count !== null && <span className="adm-badge">{count}</span>}
          </button>
        ))}
      </div>

      {tab === "intents" && (
        <div className="adm-split">
          <section className="adm-card adm-split-pane">
            <div className="adm-card-header">
              <div className="adm-search">
                <div className="adm-input-wrap">
                  <VscSearch className="adm-input-icon" aria-hidden />
                  <input className="adm-input adm-input-with-icon" placeholder="Konu ya da kalıp ara..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Konularda ara" />
                </div>
              </div>
              <button type="button" className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => (setSeedPattern(null), open("new"))}>
                <VscAdd aria-hidden /> Yeni
              </button>
            </div>
            <div className="adm-card-scroll">
              <ul className="adm-list">
                {filtered.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      className={`adm-list-item adm-list-button${selected === i.id ? " is-selected" : ""}`}
                      onClick={() => open(i.id)}
                    >
                      <div className="adm-list-main">
                        <div className="adm-list-title">
                          {i.title_tr}
                          {!i.is_active && <VscCircleSlash aria-label="Pasif" />}
                        </div>
                        <div className="adm-list-sub">
                          {i.category} · {i.chat_patterns.length} kalıp
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && <li className="adm-empty">Sonuç yok.</li>}
              </ul>
            </div>
          </section>

          <section className="adm-card" ref={editorRef} style={{ scrollMarginTop: 12 }}>
            {selected === null ? (
              <div className="adm-empty" style={{ padding: 48 }}>
                <VscInfo size={28} aria-hidden />
                Düzenlemek için bir konu seçin ya da yeni konu ekleyin.
              </div>
            ) : (
              <IntentForm
                key={selected === "new" ? `new-${seedPattern}` : selected}
                intent={current}
                intents={intents}
                categories={categories}
                seedPattern={seedPattern}
                onSaved={(id) => {
                  setSelected(id);
                  router.refresh();
                }}
                onDeleted={() => {
                  setSelected(null);
                  router.refresh();
                }}
              />
            )}
          </section>
        </div>
      )}

      {tab === "unanswered" && (
        <section className="adm-card">
          <div className="adm-card-header">
            <h2>
              <VscQuestion aria-hidden /> BuğrAI&apos;ın net cevap veremediği sorular
            </h2>
          </div>
          <p className="adm-help" style={{ padding: "12px 16px 0" }}>
            Bir soruyu mevcut bir konuya kalıp olarak ekleyin ya da yeni bir konu oluşturun. Konu düzenleyicisinde kalıp alanına eklemeniz yeterli.
          </p>
          {unanswered.length === 0 ? (
            <div className="adm-empty">Cevapsız soru yok.</div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Soru</th>
                    <th>Sayı</th>
                    <th className="adm-hide-mobile">Son soruluş</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {unanswered.map((u) => (
                    <tr key={u.query}>
                      <td>{u.query}</td>
                      <td>{u.times_asked}</td>
                      <td className="adm-nowrap adm-hide-mobile">{formatDate(u.last_asked)}</td>
                      <td className="adm-nowrap">
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          onClick={() => {
                            setSeedPattern(u.query);
                            setSelected("new");
                            switchTab("intents");
                          }}
                        >
                          <VscAdd aria-hidden /> Yeni konu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "logs" && <LogsPanel logs={logs} />}
      {tab === "test" && <TestPanel />}
    </>
  );
}

function linesOf(intent: AdminIntent | undefined, lang: "tr" | "en") {
  return (intent?.chat_patterns ?? []).filter((p) => p.lang === lang).map((p) => p.pattern).join("\n");
}

function IntentForm({
  intent,
  intents,
  categories,
  seedPattern,
  onSaved,
  onDeleted,
}: {
  intent?: AdminIntent;
  intents: AdminIntent[];
  categories: string[];
  seedPattern: string | null;
  onSaved: (id: string) => void;
  onDeleted: () => void;
}) {
  const { state, onSubmit, pending, errors } = useAdminAction(saveIntent, { onSuccess: (r) => r.data && onSaved(r.data.id) });
  const has = (l: string) => ["title", "answer", "patterns"].some((k) => errors[`${k}_${l}`]);

  return (
    <form onSubmit={onSubmit} className="adm-form">
      <div className="adm-card-header">
        <h2>
          <VscRobot aria-hidden /> {intent ? intent.title_tr : "Yeni konu"}
        </h2>
      </div>
      <div className="adm-card-body adm-form">
        <FormError state={state} />
        <input type="hidden" name="original_id" value={intent?.id ?? ""} />
        <div className="adm-form-grid">
          <TextField label="Kimlik" hint="(benzersiz)" name="id" defaultValue={intent?.id} required maxLength={64} mono errors={errors} placeholder="egitim-bilgisi" />
          <TextField label="Kategori" name="category" defaultValue={intent?.category ?? "about"} required maxLength={40} mono errors={errors} list="intent-categories" help="smalltalk kategorisi önerilerde gösterilmez." />
          <datalist id="intent-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <TextField label="Öncelik" name="priority" type="number" min={0} max={1000} defaultValue={intent?.priority ?? 10} errors={errors} help="Yüksek öncelik, popüler sorularda ve eşitlikte öne çıkar." />
          <Toggle name="is_active" label="Aktif" description="Pasif konular BuğrAI tarafından kullanılmaz." defaultChecked={intent?.is_active ?? true} />
        </div>

        <LangTabs errorsIn={{ tr: has("tr"), en: has("en") }}>
          {(l) => (
            <div className="adm-form">
              <TextField
                label={l === "tr" ? "Kısa soru (seçenek butonunda görünür)" : "Short question (shown on option chips)"}
                name={`title_${l}`}
                defaultValue={intent?.[`title_${l}`]}
                required
                maxLength={160}
                errors={errors}
              />
              <TextAreaField label={l === "tr" ? "Cevap" : "Answer"} name={`answer_${l}`} defaultValue={intent?.[`answer_${l}`]} required maxLength={4000} rows={6} errors={errors} />
              <TextAreaField
                label={l === "tr" ? "Soru kalıpları (her satır bir kalıp)" : "Question patterns (one per line)"}
                name={`patterns_${l}`}
                defaultValue={l === "tr" && seedPattern ? [linesOf(intent, "tr"), seedPattern].filter(Boolean).join("\n") : linesOf(intent, l)}
                rows={8}
                mono
                errors={errors}
                help="Ziyaretçilerin yazabileceği farklı ifadeler. Büyük/küçük harf, Türkçe karakter ve küçük yazım hataları otomatik tolere edilir."
              />
            </div>
          )}
        </LangTabs>

        <div className="adm-form-grid">
          <TextAreaField label="Anahtar kelimeler" hint="(her satır bir kelime)" name="keywords" defaultValue={intent?.keywords.join("\n")} rows={5} mono errors={errors} help="Konuyu güçlü biçimde işaret eden tek kelimeler, iki dilde." />
          <TextAreaField
            label="Bağlantılar"
            hint="(her satır: Etiket TR | Label EN | /adres)"
            name="links"
            defaultValue={intent?.links.map((l) => `${l.label.tr} | ${l.label.en} | ${l.href}`).join("\n")}
            rows={5}
            mono
            errors={errors}
          />
          <SelectField
            wrapClassName="adm-span-2"
            label="Takip soruları"
            name="follow_ups_select"
            multiple
            defaultValue={intent?.follow_ups ?? []}
            size={6}
            help="Cevaptan sonra önerilecek en fazla 6 konu (Ctrl/Cmd ile çoklu seçim)."
            errors={errors}
            onChange={(e) => {
              const hidden = e.currentTarget.form?.elements.namedItem("follow_ups") as HTMLInputElement | null;
              if (hidden) hidden.value = [...e.currentTarget.selectedOptions].map((o) => o.value).join(",");
            }}
          >
            {intents
              .filter((i) => i.id !== intent?.id)
              .map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title_tr} ({i.id})
                </option>
              ))}
          </SelectField>
          <input type="hidden" name="follow_ups" defaultValue={intent?.follow_ups.join(",") ?? ""} />
          {errors.follow_ups && <p className="adm-error-text adm-span-2">{errors.follow_ups[0]}</p>}
        </div>

        <div className="adm-form-actions adm-sticky-actions">
          <SubmitButton pending={pending}>{intent ? "Kaydet" : "Konuyu ekle"}</SubmitButton>
          {intent && (
            <DeleteButton
              action={deleteIntent}
              fields={{ id: intent.id }}
              title="Konu silinsin mi?"
              message={`"${intent.title_tr}" ve ${intent.chat_patterns.length} soru kalıbı silinecek.`}
              size="md"
              iconOnly={<VscTrash />}
              onDone={onDeleted}
            />
          )}
        </div>
      </div>
    </form>
  );
}

function LogsPanel({ logs }: { logs: ChatLogRow[] }) {
  const router = useRouter();
  const { onSubmit, pending } = useAdminAction(clearChatLogs, { onSuccess: () => router.refresh() });
  return (
    <section className="adm-card">
      <div className="adm-card-header">
        <h2>
          <VscHistory aria-hidden /> Son 200 soru
        </h2>
        <form onSubmit={onSubmit} className="adm-toolbar">
          <select name="scope" className="adm-select" style={{ width: "auto" }} aria-label="Temizleme kapsamı" defaultValue="older_than_30_days">
            <option value="older_than_30_days">30 günden eski kayıtlar</option>
            <option value="answered">Cevaplanmış kayıtlar</option>
            <option value="all">Tüm kayıtlar</option>
          </select>
          <button type="submit" className="adm-btn adm-btn-danger adm-btn-sm" disabled={pending}>
            <VscTrash aria-hidden /> Temizle
          </button>
        </form>
      </div>
      {logs.length === 0 ? (
        <div className="adm-empty">Kayıt yok.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Soru</th>
                <th>Sonuç</th>
                <th className="adm-hide-mobile">Konu</th>
                <th className="adm-hide-mobile">Puan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="adm-nowrap">{formatDate(l.created_at)}</td>
                  <td>
                    {l.query} <span className="adm-badge">{l.lang.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`adm-badge ${RESULT_LABEL[l.result_type]?.cls ?? ""}`}>{RESULT_LABEL[l.result_type]?.label ?? l.result_type}</span>
                  </td>
                  <td className="adm-hide-mobile adm-mono">{l.intent_id ?? l.candidates.join(", ")}</td>
                  <td className="adm-hide-mobile adm-score">{l.score?.toFixed(2) ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TestPanel() {
  const { state, onSubmit, pending } = useAdminAction(previewMatch, { silent: true });
  const data = state?.ok ? state.data : undefined;
  return (
    <section className="adm-card">
      <div className="adm-card-header">
        <h2>
          <VscBeaker aria-hidden /> Eşleştirmeyi test et
        </h2>
      </div>
      <form onSubmit={onSubmit} className="adm-card-body adm-form">
        <p className="adm-help">Bir soru yazın; BuğrAI&apos;ın hangi konuları ne puanla eşleştirdiğini görün. Bu test kayıtlara yazılmaz.</p>
        <div className="adm-addon">
          <input name="message" className="adm-input" placeholder="hangi okulda okudun" maxLength={300} required aria-label="Test sorusu" />
          <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
            <VscPlay aria-hidden /> Test et
          </button>
        </div>
        {state && !state.ok && <FormError state={state} />}
        {data && (
          <div className="adm-form">
            <p className="adm-alert adm-alert-info">
              <VscInfo aria-hidden />
              Sonuç: <strong>{data.result === "answer" ? "Doğrudan cevap" : data.result === "clarify" ? "Seçenek sunulur" : "Anlaşılmadı"}</strong>
              <span className="adm-muted"> (0.60 üzeri ve rakibinden 0.12 önde ise doğrudan cevap verilir)</span>
            </p>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Konu</th>
                    <th>Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {t.title} <span className="adm-code">{t.id}</span>
                      </td>
                      <td className="adm-score">{t.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
