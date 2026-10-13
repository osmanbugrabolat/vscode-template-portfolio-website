import * as z from "zod";
import type { Lang } from "@/lib/chatbot/types";
import { httpsUrl, singleLine, text } from "@/lib/validation";

/**
 * The CV is one JSON document per language (table cv_documents). The admin
 * editor submits it as a single JSON field; this schema is the only gate.
 * Inline **bold** is the only markup, see parseInline().
 */

export const CV_LANGS = ["tr", "en"] as const;
export type CvLang = (typeof CV_LANGS)[number];

function isContactUrl(value: string): boolean {
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return value.length <= 320;
  if (/^tel:\+?[0-9]{6,20}$/.test(value)) return true;
  return httpsUrl.safeParse(value).success;
}

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || httpsUrl.safeParse(v).success, { error: "Geçerli bir https:// adresi girin ya da boş bırakın." });

const bullets = z.array(text(1500, 1)).max(10, { error: "En fazla 10 madde olabilir." });

export const CvContactSchema = z.object({
  label: singleLine(80, 1),
  url: z.string().trim().max(2000).refine(isContactUrl, { error: "https://, mailto: ya da tel: ile başlayan bir adres girin." }),
});

export const CvEducationSchema = z.object({
  school: singleLine(120, 1),
  degree: singleLine(120),
  date: singleLine(60),
  gpa: singleLine(20),
});

export const CvExperienceSchema = z.object({
  company: singleLine(120, 1),
  position: singleLine(120),
  date: singleLine(60),
  bullets,
});

export const CvProjectSchema = z.object({
  title: singleLine(120, 1),
  url: optionalUrl,
  bullets,
});

export const CvSkillGroupSchema = z.object({
  title: singleLine(60, 1),
  items: z.array(singleLine(60, 1)).max(12, { error: "En fazla 12 öğe olabilir." }),
});

export const CvCertificateSchema = z.object({
  name: singleLine(120, 1),
  issuer: singleLine(60),
  url: optionalUrl,
});

export const CvLanguageSchema = z.object({
  name: singleLine(40, 1),
  level: singleLine(60),
  details: z.array(singleLine(80, 1)).max(6, { error: "En fazla 6 satır olabilir." }),
});

export const CvDataSchema = z.object({
  name: singleLine(80, 1),
  title: singleLine(120),
  contacts: z.array(CvContactSchema).max(8, { error: "En fazla 8 iletişim bilgisi olabilir." }),
  about: text(3000),
  education: z.array(CvEducationSchema).max(5),
  experiences: z.array(CvExperienceSchema).max(20),
  projects: z.array(CvProjectSchema).max(20),
  skills: z.array(CvSkillGroupSchema).max(4, { error: "En fazla 4 sütun olabilir." }),
  certificates: z.array(CvCertificateSchema).max(20),
  languages: z.array(CvLanguageSchema).max(6),
});

export type CvData = z.output<typeof CvDataSchema>;
export type CvExperience = CvData["experiences"][number];
export type CvProject = CvData["projects"][number];

/** Form payload: the language plus the whole document as a JSON string. */
export const CvSaveSchema = z.object({
  lang: z.enum(CV_LANGS),
  data: z
    .string()
    .max(200_000)
    .transform((s, ctx) => {
      try {
        return JSON.parse(s) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Geçersiz veri." });
        return z.NEVER;
      }
    })
    .pipe(CvDataSchema),
});

export const EMPTY_CV: CvData = {
  name: "",
  title: "",
  contacts: [],
  about: "",
  education: [],
  experiences: [],
  projects: [],
  skills: [],
  certificates: [],
  languages: [],
};

export const CV_LABELS: Record<Lang, Record<"about" | "education" | "experiences" | "projects" | "skills" | "certificates" | "languages" | "gpa", string>> = {
  tr: {
    about: "Hakkımda",
    education: "Eğitim",
    experiences: "Deneyimler",
    projects: "Projeler",
    skills: "Teknik Beceriler",
    certificates: "Sertifikalar",
    languages: "Diller",
    gpa: "Not Ortalaması",
  },
  en: {
    about: "About Me",
    education: "Education",
    experiences: "Experiences",
    projects: "Projects",
    skills: "Technical Skills",
    certificates: "Certificates",
    languages: "Languages",
    gpa: "GPA",
  },
};

export type InlineSegment = { text: string; bold: boolean };

/** Splits "a **b** c" into plain and bold runs. Unclosed ** stays literal. */
export function parseInline(source: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of source.matchAll(re)) {
    if (m.index > last) out.push({ text: source.slice(last, m.index), bold: false });
    out.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last), bold: false });
  return out;
}

/** Display form of a link: protocol and trailing slash dropped. */
export function displayUrl(url: string): string {
  return url.replace(/^(https?:\/\/|mailto:|tel:)/, "").replace(/\/$/, "");
}

export const cvFileName = (lang: CvLang) => `osmanbugrabolat-cv-${lang}.pdf`;
