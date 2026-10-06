import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "@/lib/media";
import { serverEnv } from "./env";

export interface MediaItem {
  path: string;
  url: string;
  name: string;
  size: number;
  mime: string;
  createdAt: string | null;
  kind: "image" | "pdf";
}

/** Files bundled with the site under /public that content may reference. */
export const STATIC_ASSETS: MediaItem[] = [
  { path: "public/cv.pdf", url: "/cv.pdf", name: "cv.pdf", size: 0, mime: "application/pdf", createdAt: null, kind: "pdf" },
  { path: "public/bugra.png", url: "/bugra.png", name: "bugra.png", size: 0, mime: "image/png", createdAt: null, kind: "image" },
  ...["oracle_cert.jpg", "python_tensorflow.jpg", "r_programming.jpg", "HWEND_177820.png", "HWEND_721526.png", "HWEND_036679.png", "HWEND_580148.png", "HWEND_690969.png", "HWEND_727737.png"].map(
    (f): MediaItem => ({
      path: `public/certificates/${f}`,
      url: `/certificates/${f}`,
      name: f,
      size: 0,
      mime: f.endsWith(".png") ? "image/png" : "image/jpeg",
      createdAt: null,
      kind: "image",
    }),
  ),
];

/** Uploaded media (uploads/YYYY-MM/*), newest first. Uses the admin's RLS-scoped client. */
export async function listUploadedMedia(db: SupabaseClient): Promise<MediaItem[]> {
  const bucket = db.storage.from(MEDIA_BUCKET);
  const { data: folders, error } = await bucket.list("uploads", { limit: 1000, sortBy: { column: "name", order: "desc" } });
  if (error || !folders) return [];

  const lists = await Promise.all(
    folders
      .filter((f) => f.id === null && /^\d{4}-\d{2}$/.test(f.name))
      .map(async (folder) => {
        const { data } = await bucket.list(`uploads/${folder.name}`, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
        return (data ?? [])
          .filter((f) => f.id !== null)
          .map((f): MediaItem => {
            const path = `uploads/${folder.name}/${f.name}`;
            const mime = (f.metadata?.mimetype as string | undefined) ?? "";
            return {
              path,
              url: `${serverEnv.supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`,
              name: f.name.replace(/^[a-f0-9-]{36}-?/, "") || f.name,
              size: (f.metadata?.size as number | undefined) ?? 0,
              mime,
              createdAt: f.created_at ?? null,
              kind: mime === "application/pdf" || f.name.endsWith(".pdf") ? "pdf" : "image",
            };
          });
      }),
  );
  return lists.flat().sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}
