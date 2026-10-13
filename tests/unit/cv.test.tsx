import { describe, expect, it, vi } from "vitest";
import cms from "../../supabase/content/cms.json";
import { renderCvPdf } from "@/lib/cv/render";
import { CvDataSchema, CvSaveSchema, displayUrl, EMPTY_CV, parseInline, type CvData } from "@/lib/cv/schema";
import { routeSchema } from "@/lib/validation";

const seed = cms.cv as unknown as Record<"tr" | "en", CvData>;

describe("CV schema", () => {
  it("accepts the seeded documents", () => {
    for (const lang of ["tr", "en"] as const) {
      const r = CvDataSchema.safeParse(seed[lang]);
      expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    }
  });

  it("accepts a document with only a name", () => {
    expect(CvDataSchema.safeParse({ ...EMPTY_CV, name: "A" }).success).toBe(true);
  });

  it("only allows https, mailto and tel contact links", () => {
    const withUrl = (url: string) => CvDataSchema.safeParse({ ...EMPTY_CV, name: "A", contacts: [{ label: "x", url }] }).success;
    expect(withUrl("https://github.com/x")).toBe(true);
    expect(withUrl("mailto:a@b.co")).toBe(true);
    expect(withUrl("tel:+905555555555")).toBe(true);
    for (const bad of ["javascript:alert(1)", "http://example.com", "tel:abc", "//evil.com"]) expect(withUrl(bad)).toBe(false);
  });

  it("rejects unsafe project and certificate links", () => {
    const project = { title: "P", url: "javascript:alert(1)", bullets: [] };
    expect(CvDataSchema.safeParse({ ...EMPTY_CV, name: "A", projects: [project] }).success).toBe(false);
    expect(CvDataSchema.safeParse({ ...EMPTY_CV, name: "A", projects: [{ ...project, url: "" }] }).success).toBe(true);
  });

  it("requires a name and rejects emoji", () => {
    expect(CvDataSchema.safeParse({ ...EMPTY_CV, name: " " }).success).toBe(false);
    expect(CvDataSchema.safeParse({ ...EMPTY_CV, name: "A", about: "hi \u{1F600}" }).success).toBe(false);
  });

  it("parses the form payload and rejects broken JSON", () => {
    const ok = CvSaveSchema.safeParse({ lang: "tr", data: JSON.stringify(seed.tr) });
    expect(ok.success).toBe(true);
    expect(CvSaveSchema.safeParse({ lang: "tr", data: "{not json" }).success).toBe(false);
    expect(CvSaveSchema.safeParse({ lang: "de", data: JSON.stringify(seed.tr) }).success).toBe(false);
  });
});

describe("inline markup", () => {
  it("splits bold runs", () => {
    expect(parseInline("using **Kotlin** and **FastAPI**.")).toEqual([
      { text: "using ", bold: false },
      { text: "Kotlin", bold: true },
      { text: " and ", bold: false },
      { text: "FastAPI", bold: true },
      { text: ".", bold: false },
    ]);
  });

  it("leaves unclosed markers as text", () => {
    expect(parseInline("a ** b")).toEqual([{ text: "a ** b", bold: false }]);
  });

  it("shortens links for display", () => {
    expect(displayUrl("https://www.hsdturkiye.com/")).toBe("www.hsdturkiye.com");
    expect(displayUrl("mailto:a@b.co")).toBe("a@b.co");
  });
});

describe("CV PDF", () => {
  it("renders both seeded documents", async () => {
    for (const lang of ["tr", "en"] as const) {
      const pdf = await renderCvPdf(CvDataSchema.parse(seed[lang]), lang);
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
      expect(pdf.toString("latin1")).toMatch(/\/Type \/Page\b/);
    }
  });
});

describe("routes", () => {
  it("reserves the generated PDF path", () => {
    expect(routeSchema.safeParse("/cv-pdf").success).toBe(false);
    expect(routeSchema.safeParse("/cv-pdf/tr").success).toBe(false);
    expect(routeSchema.safeParse("/cv").success).toBe(true);
  });
});

describe("CV editor", () => {
  it("renders the seeded documents with every section", async () => {
    vi.mock("@/app/admin/_actions/cv", () => ({ saveCv: async () => ({ ok: true }), previewCv: async () => ({ ok: true }) }));
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { default: CvEditor } = await import("@/app/admin/cv/CvEditor");
    const { ToastProvider } = await import("@/app/admin/_components/ui");
    const html = renderToStaticMarkup(
      <ToastProvider>
        <CvEditor docs={{ tr: { data: seed.tr, updatedAt: null }, en: { data: seed.en, updatedAt: null } }} />
      </ToastProvider>,
    );
    for (const text of ["Hakkımda", "Deneyimler", "Projeler", "Teknik Beceriler", "Sertifikalar", "Diller", "Ilgar Teknoloji", "/cv-pdf/tr"]) expect(html).toContain(text);
    // Saved content is not dirty, so saving starts disabled and no validation errors show.
    expect(html).not.toContain("adm-badge-warning");
    expect(html).not.toContain("Kaydetmeden önce düzeltin");
  });
});
