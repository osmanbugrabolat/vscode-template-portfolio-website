import { requireAdmin } from "@/lib/server/auth";
import { CvDataSchema, EMPTY_CV, type CvData, type CvLang } from "@/lib/cv/schema";
import CvEditor from "./CvEditor";

export const metadata = { title: "CV" };

export default async function CvPage() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("cv_documents").select("lang, data, updated_at");
  if (error) throw new Error("CV yüklenemedi.");

  const docs = {} as Record<CvLang, { data: CvData; updatedAt: string | null }>;
  for (const lang of ["tr", "en"] as const) {
    const row = data.find((r) => r.lang === lang);
    const parsed = row ? CvDataSchema.safeParse(row.data) : null;
    docs[lang] = { data: parsed?.success ? parsed.data : EMPTY_CV, updatedAt: row?.updated_at ?? null };
  }

  return (
    <div className="adm-page adm-page-wide">
      <CvEditor docs={docs} />
    </div>
  );
}
