import { getCvPdf } from "@/lib/cv/data";
import { CV_LANGS, cvFileName, type CvLang } from "@/lib/cv/schema";

/**
 * The CV as a PDF, generated from the cv_documents row of that language.
 * Served outside /api so the site's own PDF viewer may frame it.
 */
export async function GET(request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(CV_LANGS as readonly string[]).includes(lang)) return new Response("Not found", { status: 404 });

  const pdf = await getCvPdf(lang as CvLang);
  if (!pdf) return new Response("Not found", { status: 404 });

  const headers = {
    // Browsers revalidate every time, so an edit shows up on the next load; unchanged CVs cost a 304.
    "Cache-Control": "public, max-age=0, must-revalidate",
    ETag: pdf.etag,
  };
  if (request.headers.get("if-none-match") === pdf.etag) return new Response(null, { status: 304, headers });

  const download = new URL(request.url).searchParams.has("download");
  return new Response(Buffer.from(pdf.base64, "base64"), {
    headers: {
      ...headers,
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${cvFileName(lang as CvLang)}"`,
    },
  });
}
