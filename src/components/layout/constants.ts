import type { Lang } from "@/lib/chatbot/types";
import { DEFAULT_FILE_ICON, STATUS_LANGUAGE, nodeName, type ExplorerItem } from "@/lib/cms/types";

export interface FileTab {
  id: string;
  name: string;
  /** Site route for pages, absolute URL for external links. */
  path: string;
  icon: string;
  language: string;
  isExternal: boolean;
}

export interface LayoutSettings {
  name: string;
  email: string;
  github_url: string;
  linkedin_url: string;
  medium_url: string;
  terminal_whoami: string;
  chat_greeting_tr: string;
  chat_greeting_en: string;
}

export function toFileTab(item: ExplorerItem, lang: Lang): FileTab | null {
  if (item.kind !== "file" || !item.file_type) return null;
  const isExternal = item.file_type === "link";
  const path = isExternal ? item.url : item.route;
  if (!path) return null;
  return {
    id: item.id,
    name: nodeName(item, lang),
    path,
    icon: item.icon || DEFAULT_FILE_ICON[item.file_type],
    language: STATUS_LANGUAGE[item.file_type],
    isExternal,
  };
}

export function sortItems<T extends Pick<ExplorerItem, "sort_order" | "name" | "kind">>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"));
}
