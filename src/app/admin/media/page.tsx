import { requireAdmin } from "@/lib/server/auth";
import { listUploadedMedia, STATIC_ASSETS } from "@/lib/server/media-list";
import MediaLibrary from "./MediaLibrary";

export const metadata = { title: "Medya" };

export default async function MediaPage() {
  const { db } = await requireAdmin();
  const [uploaded, nodes, settings] = await Promise.all([
    listUploadedMedia(db),
    db.from("explorer_nodes").select("name, asset_url").not("asset_url", "is", null),
    db.from("site_settings").select("avatar_url").eq("id", 1).single(),
  ]);
  const usage: Record<string, string[]> = {};
  for (const n of nodes.data ?? []) if (n.asset_url) (usage[n.asset_url] ??= []).push(n.name);
  if (settings.data?.avatar_url) (usage[settings.data.avatar_url] ??= []).push("Profil fotoğrafı");

  return (
    <div className="adm-page">
      <MediaLibrary uploaded={uploaded} bundled={STATIC_ASSETS} usage={usage} />
    </div>
  );
}
