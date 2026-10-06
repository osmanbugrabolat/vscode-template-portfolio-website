import * as z from "zod";
import { FILE_TYPES } from "@/lib/cms/types";
import {
  assetUrl,
  checkbox,
  emailSchema,
  emptyToNull,
  httpsUrl,
  lineList,
  linkUrl,
  optionalHttpsUrl,
  optionalIconKey,
  passwordPolicy,
  routeSchema,
  singleLine,
  sortOrder,
  tagList,
  text,
  uuid,
} from "@/lib/validation";

/**
 * Schemas for every admin form. Kept out of the "use server" files so they can
 * be unit-tested with exactly the fields each form submits.
 */

export const MAX_CONTENT = 200_000;

export const NodeSchema = z
  .object({
    id: z.preprocess(emptyToNull, uuid.nullable()),
    kind: z.enum(["folder", "file"]),
    parent_id: z.preprocess(emptyToNull, uuid.nullable()),
    name: singleLine(120, 1),
    name_en: z.preprocess(emptyToNull, singleLine(120).nullable()),
    file_type: z.preprocess(emptyToNull, z.enum(FILE_TYPES as [string, ...string[]]).nullable()),
    route: z.preprocess(emptyToNull, routeSchema.nullable()),
    url: z.preprocess(emptyToNull, z.string().max(2000).nullable()),
    asset_url: z.preprocess(emptyToNull, assetUrl.nullable()),
    content_tr: text(MAX_CONTENT).optional().default(""),
    content_en: text(MAX_CONTENT).optional().default(""),
    icon: optionalIconKey.optional().default(null),
    sort_order: sortOrder.optional().default(0),
    is_published: checkbox,
    show_in_explorer: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.id && v.parent_id === v.id) ctx.addIssue({ code: "custom", path: ["parent_id"], message: "Bir öğe kendi içine taşınamaz." });
    if (v.kind === "folder") return;
    if (!v.file_type) {
      ctx.addIssue({ code: "custom", path: ["file_type"], message: "Dosya türü seçin." });
      return;
    }
    if (v.file_type === "link") {
      if (!v.url || !linkUrl.safeParse(v.url).success) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "https:// ile başlayan bir adres ya da mailto: girin." });
      }
      return;
    }
    if (!v.route) ctx.addIssue({ code: "custom", path: ["route"], message: "Sayfa adresi zorunlu. Örn: /projects/oyun" });
    if (v.file_type === "embed" && (!v.url || !httpsUrl.safeParse(v.url).success)) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Gömülecek sayfa için https:// adresi girin." });
    }
    if ((v.file_type === "pdf" || v.file_type === "image") && !v.asset_url) {
      ctx.addIssue({ code: "custom", path: ["asset_url"], message: "Bir dosya seçin ya da yükleyin." });
    }
  });

export const moveSchema = z.object({ id: uuid, direction: z.coerce.number().int().refine((d) => d === -1 || d === 1) });

export const SettingsSchema = z.object({
  name: singleLine(120, 1),
  title_tr: singleLine(160),
  title_en: singleLine(160),
  subtitle_tr: singleLine(240),
  subtitle_en: singleLine(240),
  location_tr: singleLine(120),
  location_en: singleLine(120),
  email: z.union([z.literal(""), emailSchema]),
  github_url: optionalHttpsUrl,
  linkedin_url: optionalHttpsUrl,
  medium_url: optionalHttpsUrl,
  website_url: optionalHttpsUrl,
  avatar_url: z.union([z.literal(""), assetUrl]),
  available_for_work: checkbox,
  current_focus_tr: lineList(20, 200),
  current_focus_en: lineList(20, 200),
  education_degree_tr: singleLine(160),
  education_degree_en: singleLine(160),
  education_school: singleLine(160),
  education_years: singleLine(60),
  education_gpa: singleLine(40),
  seo_title: singleLine(120),
  seo_description_tr: singleLine(320),
  seo_description_en: singleLine(320),
  chat_greeting_tr: text(500),
  chat_greeting_en: text(500),
  terminal_whoami: singleLine(200),
});

export const CategorySchema = z.object({
  id: z.preprocess(emptyToNull, uuid.nullable()),
  key: z.string().trim().regex(/^[a-z][a-z0-9_]{0,39}$/, { error: "Küçük harf ile başlamalı; harf, rakam ve _ içerebilir." }),
  label_tr: singleLine(60, 1),
  label_en: singleLine(60, 1),
  type_name: singleLine(40, 1),
});

export const SkillSchema = z.object({
  id: z.preprocess(emptyToNull, uuid.nullable()),
  category_id: uuid,
  name: singleLine(60, 1),
  level: z.coerce.number().int().min(0, { error: "0-100 arası olmalı." }).max(100, { error: "0-100 arası olmalı." }),
  icon: optionalIconKey,
});

export const ExperienceSchema = z.object({
  id: z.preprocess(emptyToNull, uuid.nullable()),
  company: singleLine(120, 1),
  position_tr: singleLine(160),
  position_en: singleLine(160),
  duration_tr: singleLine(80),
  duration_en: singleLine(80),
  location_tr: singleLine(120),
  location_en: singleLine(120),
  description_tr: text(4000),
  description_en: text(4000),
  highlights_tr: lineList(20, 300),
  highlights_en: lineList(20, 300),
  tech: tagList(30, 40),
  is_published: checkbox,
});

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const intentId = z.string().trim().max(64).regex(SLUG, { error: "Küçük harf, rakam ve tire kullanın. Örn: egitim-bilgisi" });

export const linksField = text(4000).transform((s, ctx) => {
  const links: { label: { tr: string; en: string }; href: string }[] = [];
  for (const [i, line] of s.split("\n").map((l) => l.trim()).filter(Boolean).entries()) {
    const parts = line.split("|").map((p) => p.trim());
    const [tr, en, href] = parts.length === 2 ? [parts[0], parts[0], parts[1]] : parts;
    const hrefOk = href && (/^\/(?!\/)[a-z0-9\-/.]*$/i.test(href) || /^https:\/\/[^\s]+$/.test(href) || /^mailto:[^\s@]+@[^\s@]+$/.test(href));
    if (!tr || !en || !hrefOk || parts.length > 3 || tr.length > 80 || en.length > 80 || href.length > 500) {
      ctx.addIssue({ code: "custom", message: `${i + 1}. satır hatalı. Biçim: Etiket TR | Label EN | /adres` });
      return z.NEVER;
    }
    links.push({ label: { tr, en }, href });
  }
  if (links.length > 8) {
    ctx.addIssue({ code: "custom", message: "En fazla 8 bağlantı eklenebilir." });
    return z.NEVER;
  }
  return links;
});

export const IntentSchema = z.object({
  original_id: z.preprocess(emptyToNull, intentId.nullable()),
  id: intentId,
  category: z.string().trim().regex(/^[a-z][a-z0-9_-]{0,39}$/, { error: "Küçük harf ile başlamalı (örn: projects)." }),
  priority: z.coerce.number().int().min(0).max(1000),
  title_tr: singleLine(160, 1),
  title_en: singleLine(160, 1),
  answer_tr: text(4000, 1),
  answer_en: text(4000, 1),
  patterns_tr: lineList(300, 200),
  patterns_en: lineList(300, 200),
  keywords: lineList(80, 40),
  links: linksField,
  follow_ups: z.string().max(2000).transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)).pipe(z.array(intentId).max(6)),
  is_active: checkbox,
});

export const PasswordSchema = z
  .object({
    current_password: z.string().min(1, { error: "Mevcut şifrenizi girin." }).max(128),
    new_password: passwordPolicy,
    confirm_password: z.string().max(128),
  })
  .refine((v) => v.new_password === v.confirm_password, { path: ["confirm_password"], error: "Şifreler eşleşmiyor." })
  .refine((v) => v.new_password !== v.current_password, { path: ["new_password"], error: "Yeni şifre eskisiyle aynı olamaz." });
