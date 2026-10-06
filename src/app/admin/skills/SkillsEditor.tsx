"use client";

import { useState } from "react";
import { VscAdd, VscArrowDown, VscArrowUp, VscCode, VscEdit, VscTrash } from "react-icons/vsc";
import { Icon } from "@/lib/icons";
import type { Skill, SkillCategory } from "@/lib/cms/types";
import { deleteCategory, deleteSkill, moveCategory, moveSkill, saveCategory, saveSkill } from "../_actions/content";
import { DeleteButton, FormError, IconPicker, InlineActionButton, PageHeader, SelectField, SubmitButton, TextField, useAdminAction } from "../_components/ui";

type Editing = { type: "category"; id: string | null } | { type: "skill"; id: string | null; categoryId: string } | null;

export default function SkillsEditor({ categories }: { categories: SkillCategory[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  return (
    <>
      <PageHeader
        title="Yetenekler"
        icon={<VscCode aria-hidden />}
        description="Teknolojiler kenar çubuğunda, skills.ts sayfasında ve ana sayfadaki teknoloji listesinde görünür. Seviye 0-100 arası bir çubuk olarak gösterilir."
        actions={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditing({ type: "category", id: null })}>
            <VscAdd aria-hidden /> Kategori ekle
          </button>
        }
      />

      {editing?.type === "category" && editing.id === null && (
        <div className="adm-card">
          <CategoryForm onDone={close} />
        </div>
      )}

      {categories.length === 0 && <div className="adm-card adm-empty">Henüz kategori yok.</div>}

      {categories.map((category, ci) => (
        <section key={category.id} className="adm-card">
          {editing?.type === "category" && editing.id === category.id ? (
            <CategoryForm category={category} onDone={close} />
          ) : (
            <div className="adm-card-header">
              <h2>
                {category.label_tr}
                <span className="adm-badge">{category.label_en}</span>
                <span className="adm-code">{category.key}</span>
              </h2>
              <div className="adm-btn-group">
                <InlineActionButton action={moveCategory} fields={{ id: category.id, direction: "-1" }} label="Yukarı taşı" disabled={ci === 0}>
                  <VscArrowUp />
                </InlineActionButton>
                <InlineActionButton action={moveCategory} fields={{ id: category.id, direction: "1" }} label="Aşağı taşı" disabled={ci === categories.length - 1}>
                  <VscArrowDown />
                </InlineActionButton>
                <button type="button" className="adm-btn adm-btn-sm" onClick={() => setEditing({ type: "category", id: category.id })}>
                  <VscEdit aria-hidden /> Düzenle
                </button>
                <DeleteButton
                  action={deleteCategory}
                  fields={{ id: category.id }}
                  title="Kategori silinsin mi?"
                  message={`"${category.label_tr}" ve içindeki ${category.skills.length} yetenek silinecek.`}
                  iconOnly={<VscTrash />}
                />
              </div>
            </div>
          )}

          <ul className="adm-list">
            {category.skills.map((skill, si) =>
              editing?.type === "skill" && editing.id === skill.id ? (
                <li key={skill.id} className="adm-list-item" style={{ display: "block" }}>
                  <SkillForm skill={skill} categories={categories} categoryId={category.id} onDone={close} />
                </li>
              ) : (
                <li key={skill.id} className="adm-list-item">
                  <Icon name={skill.icon} size={18} color="var(--adm-fg)" />
                  <div className="adm-list-main">
                    <div className="adm-list-title">{skill.name}</div>
                    <div className="adm-progress" style={{ maxWidth: 260, marginTop: 6 }} aria-label={`Seviye ${skill.level}`}>
                      <div style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                  <span className="adm-score">{skill.level}</span>
                  <div className="adm-btn-group">
                    <InlineActionButton action={moveSkill} fields={{ id: skill.id, direction: "-1" }} label="Yukarı taşı" disabled={si === 0}>
                      <VscArrowUp />
                    </InlineActionButton>
                    <InlineActionButton action={moveSkill} fields={{ id: skill.id, direction: "1" }} label="Aşağı taşı" disabled={si === category.skills.length - 1}>
                      <VscArrowDown />
                    </InlineActionButton>
                    <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Düzenle" title="Düzenle" onClick={() => setEditing({ type: "skill", id: skill.id, categoryId: category.id })}>
                      <VscEdit />
                    </button>
                    <DeleteButton action={deleteSkill} fields={{ id: skill.id }} title="Yetenek silinsin mi?" message={`"${skill.name}" silinecek.`} iconOnly={<VscTrash />} />
                  </div>
                </li>
              ),
            )}
            {editing?.type === "skill" && editing.id === null && editing.categoryId === category.id ? (
              <li className="adm-list-item" style={{ display: "block" }}>
                <SkillForm categories={categories} categoryId={category.id} onDone={close} />
              </li>
            ) : (
              <li className="adm-list-item">
                <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setEditing({ type: "skill", id: null, categoryId: category.id })}>
                  <VscAdd aria-hidden /> Yetenek ekle
                </button>
              </li>
            )}
          </ul>
        </section>
      ))}
    </>
  );
}

function CategoryForm({ category, onDone }: { category?: SkillCategory; onDone: () => void }) {
  const { state, onSubmit, pending, errors } = useAdminAction(saveCategory, { onSuccess: onDone });
  return (
    <form onSubmit={onSubmit} className="adm-card-body adm-form">
      <FormError state={state} />
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <div className="adm-form-grid">
        <TextField label="Kategori adı (Türkçe)" name="label_tr" defaultValue={category?.label_tr} required maxLength={60} errors={errors} autoFocus />
        <TextField label="Category name (English)" name="label_en" defaultValue={category?.label_en} required maxLength={60} errors={errors} />
        <TextField label="Anahtar" name="key" defaultValue={category?.key} required maxLength={40} mono errors={errors} help="skills.ts görünümündeki alan adı. Örn: ai_ml" />
        <TextField label="Tip adı" name="type_name" defaultValue={category?.type_name ?? "Skill[]"} required maxLength={40} mono errors={errors} help="skills.ts görünümündeki tip. Örn: Framework[]" />
      </div>
      <div className="adm-form-actions">
        <SubmitButton pending={pending}>{category ? "Kaydet" : "Kategoriyi ekle"}</SubmitButton>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onDone}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function SkillForm({ skill, categories, categoryId, onDone }: { skill?: Skill; categories: SkillCategory[]; categoryId: string; onDone: () => void }) {
  const { state, onSubmit, pending, errors } = useAdminAction(saveSkill, { onSuccess: onDone });
  const [level, setLevel] = useState(skill?.level ?? 70);
  return (
    <form onSubmit={onSubmit} className="adm-form" style={{ padding: "4px 0" }}>
      <FormError state={state} />
      <input type="hidden" name="id" value={skill?.id ?? ""} />
      <div className="adm-form-grid">
        <TextField label="Ad" name="name" defaultValue={skill?.name} required maxLength={60} errors={errors} autoFocus />
        <SelectField label="Kategori" name="category_id" defaultValue={skill?.category_id ?? categoryId} errors={errors}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label_tr}
            </option>
          ))}
        </SelectField>
        <div className="adm-field">
          <label className="adm-label" htmlFor={`level-${skill?.id ?? "new"}`}>
            Seviye
          </label>
          <div className="adm-range">
            <input id={`level-${skill?.id ?? "new"}`} type="range" name="level" min={0} max={100} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
            <output>{level}</output>
          </div>
          {errors.level && <p className="adm-error-text">{errors.level[0]}</p>}
        </div>
        <IconPicker name="icon" defaultValue={skill?.icon} groups={["tech", "file", "folder"]} errors={errors} />
      </div>
      <div className="adm-form-actions">
        <SubmitButton pending={pending}>{skill ? "Kaydet" : "Ekle"}</SubmitButton>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onDone}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
