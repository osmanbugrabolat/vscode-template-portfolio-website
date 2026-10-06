import type { Lang } from "@/lib/chatbot/types";

export type FileType = "markdown" | "home" | "experience" | "skills" | "pdf" | "image" | "embed" | "link";

export const FILE_TYPES: FileType[] = ["markdown", "home", "experience", "skills", "pdf", "image", "embed", "link"];

export interface ExplorerNode {
  id: string;
  parent_id: string | null;
  kind: "folder" | "file";
  name: string;
  name_en: string | null;
  file_type: FileType | null;
  route: string | null;
  url: string | null;
  asset_url: string | null;
  content_tr: string;
  content_en: string;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
  show_in_explorer: boolean;
}

/** What the browser needs to draw the explorer: no page bodies. */
export type ExplorerItem = Omit<ExplorerNode, "content_tr" | "content_en" | "is_published">;

export interface SiteSettings {
  name: string;
  title_tr: string;
  title_en: string;
  subtitle_tr: string;
  subtitle_en: string;
  location_tr: string;
  location_en: string;
  email: string;
  github_url: string;
  linkedin_url: string;
  medium_url: string;
  website_url: string;
  avatar_url: string;
  available_for_work: boolean;
  current_focus_tr: string[];
  current_focus_en: string[];
  education_degree_tr: string;
  education_degree_en: string;
  education_school: string;
  education_years: string;
  education_gpa: string;
  seo_title: string;
  seo_description_tr: string;
  seo_description_en: string;
  chat_greeting_tr: string;
  chat_greeting_en: string;
  terminal_whoami: string;
}

export interface Skill {
  id: string;
  category_id: string;
  name: string;
  level: number;
  icon: string | null;
  sort_order: number;
}

export interface SkillCategory {
  id: string;
  key: string;
  label_tr: string;
  label_en: string;
  type_name: string;
  sort_order: number;
  skills: Skill[];
}

export interface Experience {
  id: string;
  company: string;
  position_tr: string;
  position_en: string;
  duration_tr: string;
  duration_en: string;
  location_tr: string;
  location_en: string;
  description_tr: string;
  description_en: string;
  highlights_tr: string[];
  highlights_en: string[];
  tech: string[];
  sort_order: number;
  is_published: boolean;
}

export interface SiteData {
  settings: SiteSettings;
  nodes: ExplorerNode[];
  skillCategories: SkillCategory[];
  experiences: Experience[];
}

/** Picks the requested language, falling back to the other one when empty. */
export function pick<T extends string | string[]>(tr: T, en: T, lang: Lang): T {
  const isEmpty = (v: T) => (Array.isArray(v) ? v.length === 0 : !v.trim());
  if (lang === "en") return isEmpty(en) ? tr : en;
  return isEmpty(tr) ? en : tr;
}

export function nodeName(node: Pick<ExplorerNode, "name" | "name_en">, lang: Lang): string {
  return lang === "en" && node.name_en ? node.name_en : node.name;
}

export const DEFAULT_FILE_ICON: Record<FileType, string> = {
  markdown: "markdown",
  home: "markdown",
  experience: "typescript",
  skills: "typescript",
  pdf: "pdf",
  image: "image",
  embed: "play",
  link: "link",
};

export const STATUS_LANGUAGE: Record<FileType, string> = {
  markdown: "Markdown",
  home: "Markdown",
  experience: "TypeScript",
  skills: "TypeScript",
  pdf: "PDF",
  image: "Image",
  embed: "Game",
  link: "Link",
};
