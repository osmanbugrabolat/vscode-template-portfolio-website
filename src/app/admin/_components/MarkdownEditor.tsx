"use client";

import { useRef, useState } from "react";
import {
  VscBold,
  VscItalic,
  VscLink,
  VscListUnordered,
  VscListOrdered,
  VscQuote,
  VscCode,
  VscFileMedia,
  VscSymbolKeyword,
  VscEdit,
  VscPreview,
  VscSplitHorizontal,
  VscHorizontalRule,
} from "react-icons/vsc";
import Markdown, { WIDGETS, type MarkdownContext } from "@/components/content/Markdown";
import { containsEmoji } from "@/lib/validation";

const WIDGET_LABELS: Record<(typeof WIDGETS)[number], string> = {
  "profile-header": "Profil başlığı (fotoğraf, isim, unvan, bağlantılar)",
  "current-focus": "Şu anki odak listesi",
  "tech-stack": "Teknoloji listesi (Yetenekler'den)",
  "contact-details": "E-posta ve konum",
  "social-links": "Sosyal medya bağlantıları",
};

type Mode = "edit" | "split" | "preview";

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export default function MarkdownEditor({
  name,
  defaultValue,
  ctx,
  error,
  label,
}: {
  name: string;
  defaultValue: string;
  ctx: MarkdownContext;
  error?: string[];
  label: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<Mode>("split");
  const ref = useRef<HTMLTextAreaElement>(null);
  const hasEmoji = containsEmoji(value);

  /** Wraps the selection (or inserts a placeholder) and keeps focus in the editor. */
  const apply = (before: string, after = "", placeholder = "") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const lineEnd = value.indexOf("\n", e);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(lineStart, end) || "metin";
    const replaced = block
      .split("\n")
      .map((l, i) => (prefix === "1. " ? `${i + 1}. ` : prefix) + l)
      .join("\n");
    setValue(value.slice(0, lineStart) + replaced + value.slice(end));
    requestAnimationFrame(() => el.focus());
  };

  const insertBlock = (text: string) => {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    const needsBreak = pos > 0 && value[pos - 1] !== "\n";
    const insertion = `${needsBreak ? "\n\n" : ""}${text}\n`;
    setValue(value.slice(0, pos) + insertion + value.slice(pos));
    requestAnimationFrame(() => el?.focus());
  };

  return (
    <div className="adm-field">
      <span className="adm-label">{label}</span>
      <div className="adm-md" aria-invalid={error ? true : undefined}>
        <div className="adm-md-toolbar">
          <ToolButton label="Kalın" onClick={() => apply("**", "**", "kalın")}><VscBold /></ToolButton>
          <ToolButton label="İtalik" onClick={() => apply("*", "*", "italik")}><VscItalic /></ToolButton>
          <ToolButton label="Başlık" onClick={() => prefixLines("## ")}><VscSymbolKeyword /></ToolButton>
          <ToolButton label="Bağlantı" onClick={() => apply("[", "](https://)", "bağlantı metni")}><VscLink /></ToolButton>
          <ToolButton label="Görsel" onClick={() => apply("![", "](https://)", "açıklama")}><VscFileMedia /></ToolButton>
          <ToolButton label="Madde listesi" onClick={() => prefixLines("- ")}><VscListUnordered /></ToolButton>
          <ToolButton label="Numaralı liste" onClick={() => prefixLines("1. ")}><VscListOrdered /></ToolButton>
          <ToolButton label="Alıntı" onClick={() => prefixLines("> ")}><VscQuote /></ToolButton>
          <ToolButton label="Kod" onClick={() => apply("`", "`", "kod")}><VscCode /></ToolButton>
          <ToolButton label="Ayraç" onClick={() => insertBlock("---")}><VscHorizontalRule /></ToolButton>
          <span className="adm-md-sep" aria-hidden />
          <select
            className="adm-select"
            style={{ width: "auto", minHeight: 26, padding: "2px 6px", fontSize: 12 }}
            value=""
            onChange={(e) => {
              if (e.target.value) insertBlock(`{{${e.target.value}}}`);
            }}
            aria-label="Bileşen ekle"
          >
            <option value="">Bileşen ekle...</option>
            {WIDGETS.map((w) => (
              <option key={w} value={w}>
                {WIDGET_LABELS[w]}
              </option>
            ))}
          </select>
          <span style={{ flex: 1 }} />
          <div className="adm-btn-group" role="tablist" aria-label="Görünüm">
            {(
              [
                ["edit", "Düzenle", <VscEdit key="e" />],
                ["split", "Bölünmüş", <VscSplitHorizontal key="s" />],
                ["preview", "Önizleme", <VscPreview key="p" />],
              ] as const
            ).map(([m, l, icon]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={`adm-btn adm-btn-sm ${mode === m ? "adm-btn-primary" : "adm-btn-ghost"}`}
                onClick={() => setMode(m)}
              >
                {icon}
                <span className="adm-hide-mobile">{l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={`adm-md-body mode-${mode}`}>
          <textarea
            ref={ref}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="adm-textarea adm-md-input"
            spellCheck={false}
            aria-label={label}
            maxLength={200000}
          />
          <div className="adm-md-preview">
            {value.trim() ? (
              <Markdown source={value} ctx={ctx} />
            ) : (
              <div className="adm-empty">Bu dilde içerik yok. Ziyaretçiye diğer dildeki içerik gösterilir.</div>
            )}
          </div>
        </div>
        <div className="adm-md-status">
          <span>Markdown · {value.length.toLocaleString("tr-TR")} karakter</span>
          <span>{"{{bileşen}}"} satırları sitede bileşen olarak gösterilir</span>
        </div>
      </div>
      {(error?.[0] || hasEmoji) && <p className="adm-error-text">{error?.[0] ?? "Emoji kullanılamaz; ikon kullanın."}</p>}
    </div>
  );
}
