"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { VscAdd, VscArrowDown, VscArrowUp, VscCloudDownload, VscEye, VscFilePdf, VscLinkExternal, VscTrash, VscWarning } from "react-icons/vsc";
import { CV_LABELS, CvDataSchema, type CvData, type CvLang } from "@/lib/cv/schema";
import { previewCv, saveCv } from "../_actions/cv";
import { formatDate } from "../_components/labels";
import { PageHeader, TextAreaField, TextField, useAdminAction } from "../_components/ui";

type Docs = Record<CvLang, { data: CvData; updatedAt: string | null }>;

/** Textareas edit lists line by line; blank lines and padding are dropped only when sending. */
function clean(d: CvData): CvData {
  const lines = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);
  return {
    ...d,
    experiences: d.experiences.map((e) => ({ ...e, bullets: lines(e.bullets) })),
    projects: d.projects.map((p) => ({ ...p, bullets: lines(p.bullets) })),
    skills: d.skills.map((g) => ({ ...g, items: lines(g.items) })),
    languages: d.languages.map((l) => ({ ...l, details: lines(l.details) })),
  };
}

const PATH_LABELS: Record<string, string> = {
  name: "Ad", title: "Başlık", contacts: "İletişim", label: "Görünen metin", url: "Adres", about: "Hakkımda",
  education: "Eğitim", school: "Okul", degree: "Bölüm", date: "Tarih", gpa: "Not ortalaması",
  experiences: "Deneyim", company: "Şirket", position: "Pozisyon", bullets: "Madde",
  projects: "Proje", skills: "Beceri sütunu", items: "Öğe", certificates: "Sertifika", issuer: "Kurum",
  languages: "Dil", level: "Seviye", details: "Alt satır",
};

function describePath(path: PropertyKey[]): string {
  return path.map((p) => (typeof p === "number" ? String(p + 1) : (PATH_LABELS[String(p)] ?? String(p)))).join(" › ");
}

const linesOf = (a: string[]) => a.join("\n");
const toLines = (s: string) => s.split("\n");

export default function CvEditor({ docs }: { docs: Docs }) {
  const [lang, setLang] = useState<CvLang>("tr");
  const [drafts, setDrafts] = useState<Record<CvLang, CvData>>({ tr: docs.tr.data, en: docs.en.data });
  const savedJson = useMemo(() => ({ tr: JSON.stringify(clean(docs.tr.data)), en: JSON.stringify(clean(docs.en.data)) }), [docs]);
  const draft = drafts[lang];
  const set = (patch: Partial<CvData>) => setDrafts((d) => ({ ...d, [lang]: { ...d[lang], ...patch } }));

  const dirty = { tr: JSON.stringify(clean(drafts.tr)) !== savedJson.tr, en: JSON.stringify(clean(drafts.en)) !== savedJson.en };
  const validation = CvDataSchema.safeParse(clean(draft));
  const issues = validation.success ? [] : validation.error.issues;

  useEffect(() => {
    if (!dirty.tr && !dirty.en) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.tr, dirty.en]);

  const [preview, setPreview] = useState<{ lang: CvLang; url: string } | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);
  const [, startTransition] = useTransition();

  const save = useAdminAction(saveCv);
  const render = useAdminAction(previewCv, {
    silent: true,
    onSuccess: (r) => {
      if (!r.data) return;
      const bytes = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
      setPreview({ lang, url: URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })) });
    },
  });

  const submit = (action: (fd: FormData) => void) => {
    if (!validation.success) return;
    const fd = new FormData();
    fd.set("lang", lang);
    fd.set("data", JSON.stringify(validation.data));
    startTransition(() => action(fd));
  };

  const t = CV_LABELS[lang];
  const shownPreview = preview?.lang === lang ? preview.url : null;
  const publishedUrl = `/cv-pdf/${lang}`;

  return (
    <>
      <PageHeader
        title="CV"
        icon={<VscFilePdf aria-hidden />}
        description="Sitedeki CV sayfası ve indirilen PDF buradaki içerikten üretilir. Kaydettiğiniz an yayına girer. Kalın yazı için **metin** kullanın."
        actions={
          <>
            <a className="adm-btn" href={`${publishedUrl}?download`} download>
              <VscCloudDownload aria-hidden /> PDF indir
            </a>
            <a className="adm-btn" href={publishedUrl} target="_blank" rel="noopener noreferrer">
              <VscLinkExternal aria-hidden /> Yayındaki CV
            </a>
          </>
        }
      />

      <div className="adm-tabs" role="tablist">
        {(["tr", "en"] as const).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lang === l} className="adm-tab" onClick={() => setLang(l)}>
            {l === "tr" ? "Türkçe CV" : "English CV"}
            {dirty[l] && <span className="adm-badge adm-badge-warning">kaydedilmedi</span>}
          </button>
        ))}
      </div>

      <div className="adm-cv-layout">
        <div className="adm-cv-form">
          <Card title="Başlık ve iletişim">
            <div className="adm-form-grid">
              <TextField label="Ad soyad" value={draft.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} />
              <TextField label="Unvan" value={draft.title} onChange={(e) => set({ title: e.target.value })} maxLength={120} />
            </div>
            <List
              items={draft.contacts}
              onChange={(contacts) => set({ contacts })}
              blank={{ label: "", url: "https://" }}
              addLabel="İletişim ekle"
              max={8}
              render={(c, up) => (
                <div className="adm-form-grid">
                  <TextField label="Görünen metin" value={c.label} onChange={(e) => up({ label: e.target.value })} maxLength={80} />
                  <TextField label="Adres" hint="(https://, mailto: ya da tel:)" value={c.url} onChange={(e) => up({ url: e.target.value })} mono maxLength={2000} />
                </div>
              )}
            />
          </Card>

          <Card title={t.about}>
            <TextAreaField label="Metin" hint="(boş satır yeni paragraf)" value={draft.about} onChange={(e) => set({ about: e.target.value })} rows={8} maxLength={3000} />
          </Card>

          <Card title={t.education}>
            <List
              items={draft.education}
              onChange={(education) => set({ education })}
              blank={{ school: "", degree: "", date: "", gpa: "" }}
              addLabel="Okul ekle"
              max={5}
              title={(e) => e.school}
              render={(e, up) => (
                <div className="adm-form-grid">
                  <TextField label="Okul" value={e.school} onChange={(ev) => up({ school: ev.target.value })} maxLength={120} />
                  <TextField label="Tarih" value={e.date} onChange={(ev) => up({ date: ev.target.value })} maxLength={60} />
                  <TextField label="Bölüm" value={e.degree} onChange={(ev) => up({ degree: ev.target.value })} maxLength={120} />
                  <TextField label={t.gpa} value={e.gpa} onChange={(ev) => up({ gpa: ev.target.value })} maxLength={20} placeholder="3.75/4" />
                </div>
              )}
            />
          </Card>

          <Card title={t.experiences}>
            <List
              items={draft.experiences}
              onChange={(experiences) => set({ experiences })}
              blank={{ company: "", position: "", date: "", bullets: [""] }}
              addLabel="Deneyim ekle"
              addFirst
              max={20}
              title={(e) => [e.company, e.position].filter(Boolean).join(" · ")}
              render={(e, up) => (
                <div className="adm-form-grid">
                  <TextField label="Şirket / kurum" value={e.company} onChange={(ev) => up({ company: ev.target.value })} maxLength={120} />
                  <TextField label="Tarih" value={e.date} onChange={(ev) => up({ date: ev.target.value })} maxLength={60} placeholder={lang === "tr" ? "Haziran 2026 - Günümüz" : "June 2026 - Present"} />
                  <TextField wrapClassName="adm-span-2" label="Pozisyon" value={e.position} onChange={(ev) => up({ position: ev.target.value })} maxLength={120} />
                  <TextAreaField wrapClassName="adm-span-2" label="Maddeler" hint="(her satır bir madde)" value={linesOf(e.bullets)} onChange={(ev) => up({ bullets: toLines(ev.target.value) })} rows={5} />
                </div>
              )}
            />
          </Card>

          <Card title={t.projects}>
            <List
              items={draft.projects}
              onChange={(projects) => set({ projects })}
              blank={{ title: "", url: "", bullets: [""] }}
              addLabel="Proje ekle"
              max={20}
              title={(p) => p.title}
              render={(p, up) => (
                <div className="adm-form-grid">
                  <TextField label="Proje adı" value={p.title} onChange={(ev) => up({ title: ev.target.value })} maxLength={120} />
                  <TextField label="Bağlantı" hint="(isteğe bağlı)" value={p.url} onChange={(ev) => up({ url: ev.target.value })} mono maxLength={2000} placeholder="https://" />
                  <TextAreaField wrapClassName="adm-span-2" label="Maddeler" hint="(her satır bir madde)" value={linesOf(p.bullets)} onChange={(ev) => up({ bullets: toLines(ev.target.value) })} rows={5} />
                </div>
              )}
            />
          </Card>

          <Card title={t.skills}>
            <List
              items={draft.skills}
              onChange={(skills) => set({ skills })}
              blank={{ title: "", items: [""] }}
              addLabel="Sütun ekle"
              max={4}
              title={(g) => g.title}
              render={(g, up) => (
                <div className="adm-form-grid">
                  <TextField label="Sütun başlığı" value={g.title} onChange={(ev) => up({ title: ev.target.value })} maxLength={60} />
                  <TextAreaField label="Öğeler" hint="(her satır bir öğe)" value={linesOf(g.items)} onChange={(ev) => up({ items: toLines(ev.target.value) })} rows={4} />
                </div>
              )}
            />
          </Card>

          <Card title={t.certificates}>
            <List
              items={draft.certificates}
              onChange={(certificates) => set({ certificates })}
              blank={{ name: "", issuer: "", url: "" }}
              addLabel="Sertifika ekle"
              max={20}
              compact
              render={(c, up) => (
                <div className="adm-cv-row3">
                  <TextField label="Sertifika" value={c.name} onChange={(ev) => up({ name: ev.target.value })} maxLength={120} />
                  <TextField label="Kurum" value={c.issuer} onChange={(ev) => up({ issuer: ev.target.value })} maxLength={60} />
                  <TextField label="Bağlantı" value={c.url} onChange={(ev) => up({ url: ev.target.value })} mono maxLength={2000} placeholder="https://" />
                </div>
              )}
            />
          </Card>

          <Card title={t.languages}>
            <List
              items={draft.languages}
              onChange={(languages) => set({ languages })}
              blank={{ name: "", level: "", details: [] }}
              addLabel="Dil ekle"
              max={6}
              title={(l) => l.name}
              render={(l, up) => (
                <div className="adm-form-grid">
                  <TextField label="Dil" value={l.name} onChange={(ev) => up({ name: ev.target.value })} maxLength={40} />
                  <TextField label="Seviye" hint="(isteğe bağlı)" value={l.level} onChange={(ev) => up({ level: ev.target.value })} maxLength={60} />
                  <TextAreaField wrapClassName="adm-span-2" label="Alt satırlar" hint="(isteğe bağlı, her satır bir madde)" value={linesOf(l.details)} onChange={(ev) => up({ details: toLines(ev.target.value) })} rows={3} placeholder={lang === "tr" ? "Okuma - Orta" : "Reading - Intermediate"} />
                </div>
              )}
            />
          </Card>

          <div className="adm-sticky-actions">
            {issues.length > 0 && (
              <div className="adm-alert adm-alert-error" role="alert">
                <VscWarning aria-hidden />
                <div>
                  <strong>Kaydetmeden önce düzeltin:</strong>
                  <ul className="adm-cv-issues">
                    {issues.slice(0, 6).map((i, n) => (
                      <li key={n}>
                        {describePath(i.path)}: {i.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="adm-form-actions">
              <button type="button" className="adm-btn adm-btn-primary" disabled={!validation.success || save.pending || !dirty[lang]} aria-busy={save.pending} onClick={() => submit(save.formAction)}>
                {save.pending ? "Kaydediliyor..." : lang === "tr" ? "Türkçe CV'yi kaydet" : "İngilizce CV'yi kaydet"}
              </button>
              <button type="button" className="adm-btn" disabled={!validation.success || render.pending} onClick={() => submit(render.formAction)}>
                <VscEye aria-hidden /> {render.pending ? "Hazırlanıyor..." : "Önizle"}
              </button>
              {dirty[lang] && (
                <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setDrafts((d) => ({ ...d, [lang]: docs[lang].data }))}>
                  Değişiklikleri geri al
                </button>
              )}
              <span className="adm-muted">{docs[lang].updatedAt ? `Son kayıt: ${formatDate(docs[lang].updatedAt)}` : "Henüz kaydedilmedi"}</span>
            </div>
          </div>
        </div>

        <aside className="adm-card adm-cv-preview" aria-label="PDF önizleme">
          <div className="adm-card-header">
            <h2>
              <VscFilePdf aria-hidden /> {shownPreview ? "Önizleme (kaydedilmemiş)" : "Yayındaki CV"}
            </h2>
            {shownPreview && (
              <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setPreview(null)}>
                Yayındakini göster
              </button>
            )}
          </div>
          {/* key forces a reload after saving, so the published PDF is always the latest */}
          <iframe key={shownPreview ?? `${publishedUrl}-${docs[lang].updatedAt}`} src={shownPreview ?? publishedUrl} title="CV önizleme" />
        </aside>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="adm-card">
      <div className="adm-card-header">
        <h2>{title}</h2>
      </div>
      <div className="adm-card-body adm-form">{children}</div>
    </section>
  );
}

/** Repeating group with add / move / remove; items are edited in place. */
function List<T>({
  items,
  onChange,
  blank,
  render,
  addLabel,
  max,
  title,
  addFirst,
  compact,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  blank: T;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  max: number;
  title?: (item: T) => string;
  addFirst?: boolean;
  compact?: boolean;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const add = () => onChange(addFirst ? [structuredClone(blank), ...items] : [...items, structuredClone(blank)]);
  const addButton = (
    <button type="button" className="adm-btn adm-btn-sm" onClick={add} disabled={items.length >= max}>
      <VscAdd aria-hidden /> {addLabel}
    </button>
  );
  return (
    <div className="adm-cv-list">
      {addFirst && items.length > 0 && <div>{addButton}</div>}
      {items.map((item, i) => (
        <div key={i} className={`adm-cv-item${compact ? " is-compact" : ""}`}>
          <div className="adm-cv-item-head">
            <span className="adm-muted">{(title?.(item) || "").trim() || `#${i + 1}`}</span>
            <div className="adm-btn-group">
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Yukarı taşı" title="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}>
                <VscArrowUp />
              </button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Aşağı taşı" title="Aşağı taşı" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <VscArrowDown />
              </button>
              <button type="button" className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm" aria-label="Kaldır" title="Kaldır" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <VscTrash />
              </button>
            </div>
          </div>
          {render(item, (patch) => update(i, patch))}
        </div>
      ))}
      {(!addFirst || items.length === 0) && <div>{addButton}</div>}
    </div>
  );
}
