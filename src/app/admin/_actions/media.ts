"use server";

import * as z from "zod";
import { randomUUID } from "node:crypto";
import { adminAction, assertDb, ActionError, type ActionResult } from "@/lib/server/admin-action";
import { serverEnv } from "@/lib/server/env";
import { MEDIA_BUCKET, MEDIA_MAX_BYTES, MEDIA_TYPES, detectMediaType, type MediaMime } from "@/lib/media";

function publicUrl(path: string) {
  return `${serverEnv.supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/** Only our own upload paths: uploads/YYYY-MM/<uuid>-<slug>.<ext> */
const MEDIA_PATH = /^uploads\/\d{4}-\d{2}\/[a-f0-9-]{36}(-[a-z0-9-]{1,60})?\.(png|jpg|webp|gif|pdf)$/;

function slugifyFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface UploadTicket {
  path: string;
  signedUrl: string;
  contentType: MediaMime;
}

const createUploadImpl = adminAction({
  schema: z.object({
    name: z.string().min(1).max(255),
    type: z.enum(Object.keys(MEDIA_TYPES) as [MediaMime, ...MediaMime[]], { error: "Desteklenmeyen dosya türü. PNG, JPG, WEBP, GIF veya PDF yükleyin." }),
    size: z.coerce.number().int().positive().max(MEDIA_MAX_BYTES, { error: "Dosya en fazla 10 MB olabilir." }),
  }),
  audit: { action: "upload_start", entity: "media" },
  run: async ({ name, type }, { db }) => {
    const now = new Date();
    const slug = slugifyFileName(name);
    const path = `uploads/${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}${slug ? `-${slug}` : ""}.${MEDIA_TYPES[type]}`;
    const signed = assertDb(await db.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path));
    if (!signed) throw new ActionError("Yükleme başlatılamadı.");
    return { entityId: path, message: "Yükleme hazır.", data: { path, signedUrl: signed.signedUrl, contentType: type } satisfies UploadTicket };
  },
});

/**
 * After the browser uploads to the signed URL, verify the bytes really are
 * the declared type (no HTML/SVG/script smuggled under an image name).
 */
const finalizeUploadImpl = adminAction({
  schema: z.object({ path: z.string().regex(MEDIA_PATH) }),
  audit: { action: "upload", entity: "media" },
  run: async ({ path }, { db }) => {
    const bucket = db.storage.from(MEDIA_BUCKET);
    const { data: blob, error } = await bucket.download(path);
    if (error || !blob) throw new ActionError("Yüklenen dosya bulunamadı.");

    const extension = path.split(".").pop();
    const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    const detected = detectMediaType(head);
    if (blob.size > MEDIA_MAX_BYTES || !detected || MEDIA_TYPES[detected] !== extension) {
      await bucket.remove([path]);
      throw new ActionError("Dosya içeriği türüyle uyuşmuyor ya da çok büyük; yükleme reddedildi.");
    }
    return { entityId: path, message: "Dosya yüklendi.", data: { path, url: publicUrl(path) }, details: { size: blob.size, type: detected } };
  },
});

const deleteMediaImpl = adminAction({
  schema: z.object({ path: z.string().regex(MEDIA_PATH) }),
  audit: { action: "delete", entity: "media" },
  run: async ({ path }, { db }) => {
    const url = publicUrl(path);
    const [nodes, settings] = await Promise.all([
      db.from("explorer_nodes").select("name").eq("asset_url", url).limit(5),
      db.from("site_settings").select("id").eq("avatar_url", url).limit(1),
    ]);
    const users = [...(nodes.data ?? []).map((n) => n.name), ...((settings.data ?? []).length ? ["Profil fotoğrafı"] : [])];
    if (users.length) throw new ActionError(`Bu dosya kullanılıyor: ${users.join(", ")}. Önce oradan kaldırın.`);
    assertDb(await db.storage.from(MEDIA_BUCKET).remove([path]));
    return { entityId: path, message: "Dosya silindi." };
  },
});

type R<T = undefined> = ActionResult<T> | undefined;
export async function createUpload(prev: R<UploadTicket>, fd: FormData) { return createUploadImpl(prev, fd); }
export async function finalizeUpload(prev: R<{ path: string; url: string }>, fd: FormData) { return finalizeUploadImpl(prev, fd); }
export async function deleteMedia(prev: R, fd: FormData) { return deleteMediaImpl(prev, fd); }
