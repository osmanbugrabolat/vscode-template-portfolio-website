import { requireAdmin } from "@/lib/server/auth";
import { listUploadedMedia, STATIC_ASSETS } from "@/lib/server/media-list";
import type { ExplorerNode, SiteSettings, SkillCategory } from "@/lib/cms/types";
import ExplorerEditor from "./ExplorerEditor";

export const metadata = { title: "Gezgin ve Sayfalar" };

export default async function ExplorerPage({ searchParams }: { searchParams: Promise<{ node?: string }> }) {
  const { db } = await requireAdmin();
  const [nodes, settings, categories, skills, media, { node }] = await Promise.all([
    db.from("explorer_nodes").select("*").order("sort_order").order("name"),
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("skill_categories").select("*").order("sort_order"),
    db.from("skills").select("*").order("sort_order"),
    listUploadedMedia(db),
    searchParams,
  ]);
  if (nodes.error || settings.error) throw new Error("İçerik yüklenemedi.");

  const skillCategories: SkillCategory[] = (categories.data ?? []).map((c) => ({
    ...c,
    skills: (skills.data ?? []).filter((s) => s.category_id === c.id),
  }));

  return (
    <div className="adm-page adm-page-wide">
      <ExplorerEditor
        nodes={nodes.data as ExplorerNode[]}
        settings={settings.data as SiteSettings}
        skillCategories={skillCategories}
        media={[...media, ...STATIC_ASSETS]}
        initialSelected={node && /^[0-9a-f-]{36}$/.test(node) ? node : null}
      />
    </div>
  );
}
