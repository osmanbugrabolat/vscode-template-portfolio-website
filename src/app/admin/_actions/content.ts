"use server";

import { moveSchema, SettingsSchema, CategorySchema, SkillSchema, ExperienceSchema } from "@/lib/admin-schemas";
import * as z from "zod";
import { adminAction, assertDb, requireRow, ActionError, invalidate, type ActionResult } from "@/lib/server/admin-action";
import { uuid } from "@/lib/validation";

// ------------------------------------------------------------------ settings

const saveSettingsImpl = adminAction({
  schema: SettingsSchema,
  audit: { action: "update", entity: "site_settings" },
  run: async (v, { db }) => {
    requireRow(await db.from("site_settings").update(v).eq("id", 1).select("id").single());
    invalidate("cms");
    return { entityId: "1", message: "Site ayarları kaydedildi." };
  },
});

// ------------------------------------------------------------------ skills

const saveCategoryImpl = adminAction({
  schema: CategorySchema,
  audit: { action: "save", entity: "skill_category" },
  run: async ({ id, ...row }, { db }) => {
    if (id) {
      requireRow(await db.from("skill_categories").update(row).eq("id", id).select("id").single());
      invalidate("cms");
      return { entityId: id, message: "Kategori kaydedildi." };
    }
    const last = assertDb(await db.from("skill_categories").select("sort_order").order("sort_order", { ascending: false }).limit(1));
    const created = requireRow(
      await db.from("skill_categories").insert({ ...row, sort_order: (last?.[0]?.sort_order ?? -10) + 10 }).select("id").single(),
    );
    invalidate("cms");
    return { entityId: created.id, message: "Kategori eklendi." };
  },
});

const saveSkillImpl = adminAction({
  schema: SkillSchema,
  audit: { action: "save", entity: "skill" },
  run: async ({ id, ...row }, { db }) => {
    if (id) {
      requireRow(await db.from("skills").update(row).eq("id", id).select("id").single());
      invalidate("cms");
      return { entityId: id, message: "Yetenek kaydedildi." };
    }
    const last = assertDb(
      await db.from("skills").select("sort_order").eq("category_id", row.category_id).order("sort_order", { ascending: false }).limit(1),
    );
    const created = requireRow(
      await db.from("skills").insert({ ...row, sort_order: (last?.[0]?.sort_order ?? -10) + 10 }).select("id").single(),
    );
    invalidate("cms");
    return { entityId: created.id, message: "Yetenek eklendi." };
  },
});

function deleteImpl(table: "skills" | "skill_categories" | "experiences", entity: string) {
  return adminAction({
    schema: z.object({ id: uuid }),
    audit: { action: "delete", entity },
    run: async ({ id }, { db }) => {
      const deleted = requireRow(await db.from(table).delete().eq("id", id).select("id"));
      if (!deleted.length) throw new ActionError("Kayıt bulunamadı.");
      invalidate("cms");
      return { entityId: id, message: "Silindi." };
    },
  });
}

function moveImpl(table: "skills" | "skill_categories" | "experiences", entity: string) {
  return adminAction({
    schema: moveSchema,
    audit: { action: "reorder", entity },
    run: async ({ id, direction }, { db }) => {
      assertDb(await db.rpc("admin_move", { p_table: table, p_id: id, p_direction: direction }));
      invalidate("cms");
      return { entityId: id, message: "Sıralama güncellendi." };
    },
  });
}

// ------------------------------------------------------------------ experience

const saveExperienceImpl = adminAction({
  schema: ExperienceSchema,
  audit: { action: "save", entity: "experience" },
  run: async ({ id, ...row }, { db }) => {
    if (!row.position_tr && !row.position_en) {
      throw new ActionError("Pozisyon en az bir dilde girilmeli.", { position_tr: ["Pozisyon en az bir dilde girilmeli."] });
    }
    if (id) {
      requireRow(await db.from("experiences").update(row).eq("id", id).select("id").single());
      invalidate("cms");
      return { entityId: id, message: "Deneyim kaydedildi." };
    }
    const last = assertDb(await db.from("experiences").select("sort_order").order("sort_order", { ascending: false }).limit(1));
    const created = requireRow(
      await db.from("experiences").insert({ ...row, sort_order: (last?.[0]?.sort_order ?? -10) + 10 }).select("id").single(),
    );
    invalidate("cms");
    return { entityId: created.id, message: "Deneyim eklendi." };
  },
});

const deleteSkillImpl = deleteImpl("skills", "skill");
const deleteCategoryImpl = deleteImpl("skill_categories", "skill_category");
const deleteExperienceImpl = deleteImpl("experiences", "experience");
const moveSkillImpl = moveImpl("skills", "skill");
const moveCategoryImpl = moveImpl("skill_categories", "skill_category");
const moveExperienceImpl = moveImpl("experiences", "experience");

type R = ActionResult | undefined;
export async function saveSettings(prev: R, fd: FormData) { return saveSettingsImpl(prev, fd); }
export async function saveCategory(prev: R, fd: FormData) { return saveCategoryImpl(prev, fd); }
export async function deleteCategory(prev: R, fd: FormData) { return deleteCategoryImpl(prev, fd); }
export async function moveCategory(prev: R, fd: FormData) { return moveCategoryImpl(prev, fd); }
export async function saveSkill(prev: R, fd: FormData) { return saveSkillImpl(prev, fd); }
export async function deleteSkill(prev: R, fd: FormData) { return deleteSkillImpl(prev, fd); }
export async function moveSkill(prev: R, fd: FormData) { return moveSkillImpl(prev, fd); }
export async function saveExperience(prev: R, fd: FormData) { return saveExperienceImpl(prev, fd); }
export async function deleteExperience(prev: R, fd: FormData) { return deleteExperienceImpl(prev, fd); }
export async function moveExperience(prev: R, fd: FormData) { return moveExperienceImpl(prev, fd); }
