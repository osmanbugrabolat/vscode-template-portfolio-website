import { requireAdmin } from "@/lib/server/auth";
import { listUploadedMedia, STATIC_ASSETS } from "@/lib/server/media-list";
import type { SiteSettings } from "@/lib/cms/types";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Site Ayarları" };

export default async function SettingsPage() {
  const { db } = await requireAdmin();
  const [{ data, error }, media] = await Promise.all([db.from("site_settings").select("*").eq("id", 1).single(), listUploadedMedia(db)]);
  if (error || !data) throw new Error("Ayarlar yüklenemedi.");
  return (
    <div className="adm-page">
      <SettingsForm settings={data as SiteSettings} media={[...media, ...STATIC_ASSETS]} />
    </div>
  );
}
