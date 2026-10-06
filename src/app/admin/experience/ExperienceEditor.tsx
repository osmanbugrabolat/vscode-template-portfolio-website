"use client";

import { useState } from "react";
import { VscAdd, VscArrowDown, VscArrowUp, VscBriefcase, VscEdit, VscEyeClosed, VscTrash } from "react-icons/vsc";
import type { Experience } from "@/lib/cms/types";
import { deleteExperience, moveExperience, saveExperience } from "../_actions/content";
import { DeleteButton, FormError, InlineActionButton, LangTabs, PageHeader, SubmitButton, TextAreaField, TextField, Toggle, useAdminAction } from "../_components/ui";

export default function ExperienceEditor({ experiences }: { experiences: Experience[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <>
      <PageHeader
        title="Deneyim"
        icon={<VscBriefcase aria-hidden />}
        description="experience.ts sayfasında kod görünümünde listelenen iş deneyimleri. Eğitim bilgisi Site Ayarları'ndadır."
        actions={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditing("new")}>
            <VscAdd aria-hidden /> Deneyim ekle
          </button>
        }
      />

      {editing === "new" && (
        <section className="adm-card">
          <ExperienceForm onDone={() => setEditing(null)} />
        </section>
      )}

      <section className="adm-card">
        {experiences.length === 0 ? (
          <div className="adm-empty">Henüz deneyim yok.</div>
        ) : (
          <ul className="adm-list">
            {experiences.map((exp, i) =>
              editing === exp.id ? (
                <li key={exp.id} style={{ borderBottom: "1px solid var(--adm-border)" }}>
                  <ExperienceForm experience={exp} onDone={() => setEditing(null)} />
                </li>
              ) : (
                <li key={exp.id} className="adm-list-item">
                  <div className="adm-list-main">
                    <div className="adm-list-title">
                      {exp.position_tr || exp.position_en}
                      {!exp.is_published && (
                        <span className="adm-badge adm-badge-warning">
                          <VscEyeClosed aria-hidden /> Yayında değil
                        </span>
                      )}
                    </div>
                    <div className="adm-list-sub">
                      {exp.company} · {exp.duration_tr || exp.duration_en}
                    </div>
                  </div>
                  <div className="adm-btn-group">
                    <InlineActionButton action={moveExperience} fields={{ id: exp.id, direction: "-1" }} label="Yukarı taşı" disabled={i === 0}>
                      <VscArrowUp />
                    </InlineActionButton>
                    <InlineActionButton action={moveExperience} fields={{ id: exp.id, direction: "1" }} label="Aşağı taşı" disabled={i === experiences.length - 1}>
                      <VscArrowDown />
                    </InlineActionButton>
                    <button type="button" className="adm-btn adm-btn-sm" onClick={() => setEditing(exp.id)}>
                      <VscEdit aria-hidden /> Düzenle
                    </button>
                    <DeleteButton action={deleteExperience} fields={{ id: exp.id }} title="Deneyim silinsin mi?" message={`"${exp.company}" kaydı silinecek.`} iconOnly={<VscTrash />} />
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </>
  );
}

function ExperienceForm({ experience: e, onDone }: { experience?: Experience; onDone: () => void }) {
  const { state, onSubmit, pending, errors } = useAdminAction(saveExperience, { onSuccess: onDone });
  const has = (l: string) => ["position", "duration", "location", "description", "highlights"].some((k) => errors[`${k}_${l}`]);
  return (
    <form onSubmit={onSubmit} className="adm-card-body adm-form">
      <FormError state={state} />
      <input type="hidden" name="id" value={e?.id ?? ""} />
      <div className="adm-form-grid">
        <TextField label="Şirket / kurum" name="company" defaultValue={e?.company} required maxLength={120} errors={errors} autoFocus />
        <TextField label="Teknolojiler" hint="(virgülle ayırın)" name="tech" defaultValue={e?.tech.join(", ")} maxLength={1300} errors={errors} placeholder="Next.js, TypeScript, PostgreSQL" />
      </div>
      <LangTabs errorsIn={{ tr: has("tr"), en: has("en") }}>
        {(l) => (
          <div className="adm-form-grid">
            <TextField label={l === "tr" ? "Pozisyon" : "Position"} name={`position_${l}`} defaultValue={e?.[`position_${l}`]} maxLength={160} errors={errors} />
            <TextField label={l === "tr" ? "Tarih aralığı" : "Duration"} name={`duration_${l}`} defaultValue={e?.[`duration_${l}`]} maxLength={80} errors={errors} placeholder={l === "tr" ? "2024 – Günümüz" : "2024 – Present"} />
            <TextField label={l === "tr" ? "Konum" : "Location"} name={`location_${l}`} defaultValue={e?.[`location_${l}`]} maxLength={120} errors={errors} />
            <TextAreaField wrapClassName="adm-span-2" label={l === "tr" ? "Açıklama" : "Description"} name={`description_${l}`} defaultValue={e?.[`description_${l}`]} maxLength={4000} rows={3} errors={errors} />
            <TextAreaField
              wrapClassName="adm-span-2"
              label={l === "tr" ? "Öne çıkanlar (her satır bir madde)" : "Highlights (one per line)"}
              name={`highlights_${l}`}
              defaultValue={e?.[`highlights_${l}`].join("\n")}
              rows={4}
              errors={errors}
            />
          </div>
        )}
      </LangTabs>
      <Toggle name="is_published" label="Yayında" defaultChecked={e?.is_published ?? true} />
      <div className="adm-form-actions">
        <SubmitButton pending={pending}>{e ? "Kaydet" : "Deneyimi ekle"}</SubmitButton>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onDone}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
