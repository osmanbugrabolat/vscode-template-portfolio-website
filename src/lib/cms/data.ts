import "server-only";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { createPublicClient } from "@/lib/server/supabase";
import type { Lang } from "@/lib/chatbot/types";
import type { ExplorerItem, ExplorerNode, SiteData } from "./types";

export const CMS_TAG = "cms";
export const LANG_COOKIE = "lang";

const NODE_COLUMNS =
  "id, parent_id, kind, name, name_en, file_type, route, url, asset_url, content_tr, content_en, icon, sort_order, is_published, show_in_explorer";

async function loadSiteData(): Promise<SiteData> {
  const db = createPublicClient();
  const [settings, nodes, categories, skills, experiences] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("explorer_nodes").select(NODE_COLUMNS).eq("is_published", true).order("sort_order").order("name"),
    db.from("skill_categories").select("id, key, label_tr, label_en, type_name, sort_order").order("sort_order"),
    db.from("skills").select("id, category_id, name, level, icon, sort_order").order("sort_order"),
    db.from("experiences").select("*").eq("is_published", true).order("sort_order"),
  ]);
  const failed = [settings, nodes, categories, skills, experiences].find((r) => r.error);
  if (failed?.error) throw new Error(`Failed to load site content: ${failed.error.message}`);

  return {
    settings: settings.data,
    nodes: withPublishedAncestors(nodes.data as ExplorerNode[]),
    skillCategories: (categories.data ?? []).map((c) => ({
      ...c,
      skills: (skills.data ?? []).filter((s) => s.category_id === c.id),
    })),
    experiences: experiences.data ?? [],
  };
}

/**
 * All public content in one cached read (the whole site is a few hundred KB).
 * Admin mutations invalidate it with updateTag(CMS_TAG).
 */
export const getSiteData = cache(
  unstable_cache(loadSiteData, ["site-data-v1"], { tags: [CMS_TAG], revalidate: 3600 }),
);

export const getLang = cache(async (): Promise<Lang> => {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return value === "en" ? "en" : "tr";
});

/**
 * Only published rows are fetched, so a node whose ancestor was unpublished
 * has a dangling parent_id. Drop those: unpublishing a folder hides its subtree.
 */
export function withPublishedAncestors(nodes: ExplorerNode[]): ExplorerNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const visible = new Map<string, boolean>();
  const isVisible = (node: ExplorerNode, depth = 0): boolean => {
    if (visible.has(node.id)) return visible.get(node.id)!;
    let ok = true;
    if (node.parent_id) {
      const parent = byId.get(node.parent_id);
      ok = !!parent && depth < 64 && isVisible(parent, depth + 1);
    }
    visible.set(node.id, ok);
    return ok;
  };
  return nodes.filter((n) => isVisible(n));
}

export function toExplorerItems(nodes: ExplorerNode[]): ExplorerItem[] {
  return nodes.map((n) => ({
    id: n.id,
    parent_id: n.parent_id,
    kind: n.kind,
    name: n.name,
    name_en: n.name_en,
    file_type: n.file_type,
    route: n.route,
    url: n.url,
    asset_url: n.asset_url,
    icon: n.icon,
    sort_order: n.sort_order,
    show_in_explorer: n.show_in_explorer,
  }));
}

export function findNodeByRoute(nodes: ExplorerNode[], route: string): ExplorerNode | undefined {
  return nodes.find((n) => n.kind === "file" && n.route === route && n.file_type !== "link");
}
