import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/content/Markdown";
import ExperienceView from "@/components/content/ExperienceView";
import SkillsView from "@/components/content/SkillsView";
import EmbedView from "@/components/content/EmbedView";
import { ImageView, PdfView } from "@/components/content/MediaViews";
import { findNodeByRoute, getLang, getSiteData } from "@/lib/cms/data";
import { nodeName, pick, type ExplorerNode } from "@/lib/cms/types";

type Props = { params: Promise<{ slug?: string[] }> };

function routeFrom(slug: string[] | undefined): string | null {
  if (!slug?.length) return "/";
  // Routes are lowercase slug segments; anything else cannot match a node.
  if (slug.some((s) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s))) return null;
  return `/${slug.join("/")}`;
}

/** Where the "back" button of an embedded game goes: a sibling page, else home. */
function backHrefFor(node: ExplorerNode, nodes: ExplorerNode[]): string {
  const sibling = nodes.find(
    (n) => n.parent_id === node.parent_id && n.id !== node.id && n.route && (n.file_type === "markdown" || n.file_type === "home"),
  );
  return sibling?.route ?? "/";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = routeFrom((await params).slug);
  const [{ settings, nodes }, lang] = await Promise.all([getSiteData(), getLang()]);
  const node = route ? findNodeByRoute(nodes, route) : undefined;
  const siteTitle = settings.seo_title || settings.name;
  return {
    title: !node || node.route === "/" ? siteTitle : `${nodeName(node, lang)} | ${siteTitle}`,
    description: pick(settings.seo_description_tr, settings.seo_description_en, lang),
  };
}

export default async function ContentPage({ params }: Props) {
  const route = routeFrom((await params).slug);
  const [data, lang] = await Promise.all([getSiteData(), getLang()]);
  const node = route ? findNodeByRoute(data.nodes, route) : undefined;
  if (!node) notFound();

  const name = nodeName(node, lang);

  switch (node.file_type) {
    case "markdown":
    case "home":
      return (
        <div className="content-scroll">
          <Markdown
            source={pick(node.content_tr, node.content_en, lang)}
            ctx={{ lang, settings: data.settings, skillCategories: data.skillCategories }}
          />
        </div>
      );
    case "experience":
      return <ExperienceView experiences={data.experiences} settings={data.settings} lang={lang} />;
    case "skills":
      return <SkillsView categories={data.skillCategories} />;
    case "pdf":
      return node.asset_url ? <PdfView src={node.asset_url} title={name} lang={lang} /> : notFound();
    case "image":
      return node.asset_url ? <ImageView src={node.asset_url} alt={name} /> : notFound();
    case "embed":
      return node.url ? (
        <EmbedView src={node.url} title={pick(node.content_tr, node.content_en, lang) || name} backHref={backHrefFor(node, data.nodes)} lang={lang} />
      ) : (
        notFound()
      );
    default:
      notFound();
  }
}
