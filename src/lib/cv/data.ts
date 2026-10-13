import "server-only";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { CMS_TAG } from "@/lib/cms/data";
import { createPublicClient } from "@/lib/server/supabase";
import { renderCvPdf } from "./render";
import { CvDataSchema, type CvData, type CvLang } from "./schema";

/** Parses a stored document; rows that no longer match the schema are treated as missing. */
export function parseStoredCv(value: unknown): CvData | null {
  const parsed = CvDataSchema.safeParse(value);
  if (!parsed.success) {
    console.error("[cv] stored document is invalid:", parsed.error.issues.map((i) => i.path.join(".")).join(", "));
    return null;
  }
  return parsed.data;
}

async function loadCvPdf(lang: CvLang): Promise<{ base64: string; etag: string } | null> {
  const { data, error } = await createPublicClient().from("cv_documents").select("data").eq("lang", lang).maybeSingle();
  if (error) throw new Error(`Failed to load CV: ${error.message}`);
  const cv = data ? parseStoredCv(data.data) : null;
  if (!cv) return null;
  const pdf = await renderCvPdf(cv, lang);
  return { base64: pdf.toString("base64"), etag: `"${createHash("sha256").update(pdf).digest("base64url").slice(0, 27)}"` };
}

/**
 * The rendered PDF, cached with the rest of the site content: any admin edit
 * (or the database revalidate webhook) drops it via the CMS tag.
 */
export const getCvPdf = unstable_cache(loadCvPdf, ["cv-pdf-v1"], { tags: [CMS_TAG], revalidate: 3600 });
