"use server";

import { CvSaveSchema } from "@/lib/cv/schema";
import { renderCvPdf } from "@/lib/cv/render";
import { adminAction, assertDb, invalidate, type ActionResult } from "@/lib/server/admin-action";

const saveCvImpl = adminAction({
  schema: CvSaveSchema,
  audit: { action: "update", entity: "cv" },
  run: async ({ lang, data }, { db }) => {
    assertDb(await db.from("cv_documents").upsert({ lang, data }, { onConflict: "lang" }).select("lang").single());
    invalidate("cms");
    return { entityId: lang, message: lang === "tr" ? "Türkçe CV kaydedildi." : "İngilizce CV kaydedildi." };
  },
});

/** Renders the unsaved form state, so the editor can show it before saving. */
const previewCvImpl = adminAction<typeof CvSaveSchema, string>({
  schema: CvSaveSchema,
  audit: false,
  run: async ({ lang, data }) => {
    const pdf = await renderCvPdf(data, lang);
    return { data: pdf.toString("base64") };
  },
});

type R<T = undefined> = ActionResult<T> | undefined;
export async function saveCv(prev: R, fd: FormData) { return saveCvImpl(prev, fd); }
export async function previewCv(prev: R<string>, fd: FormData) { return previewCvImpl(prev, fd); }
