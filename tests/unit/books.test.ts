import { describe, expect, it } from "vitest";
import { resolveThemes } from "@/lib/books/appearance";
import { BookSchema, BookSearchSchema } from "@/lib/books/schema";

const valid = { id: "", title: "Suç ve Ceza", author: "Dostoyevski", cover_url: "https://covers.openlibrary.org/b/id/1-L.jpg", isbn: "", published_year: "1866", page_count: "", description: "", status: "read", rating: "5", started_on: "2026-09-20", finished_on: "2026-10-01", genres: "Roman, Klasik, roman", spine_color: "", notes: "" };

describe("BookSchema", () => {
  it("accepts a form submission and turns empty numbers into null", () => {
    const r = BookSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ id: null, published_year: 1866, page_count: null, rating: 5, genres: ["Roman", "Klasik"] });
  });

  it("rejects bad status, rating, cover url and emoji", () => {
    expect(BookSchema.safeParse({ ...valid, status: "owned" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, cover_url: "javascript:alert(1)" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, cover_url: "http://example.com/a.jpg" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, title: "Kitap 📚" }).success).toBe(false);
  });
});

describe("BookSchema dates and genres", () => {
  it("rejects a finish date before the start date", () => {
    expect(BookSchema.safeParse({ ...valid, started_on: "2026-10-05", finished_on: "2026-10-01" }).success).toBe(false);
  });

  it("allows empty dates and genres", () => {
    const r = BookSchema.safeParse({ ...valid, started_on: "", finished_on: "", genres: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ started_on: null, finished_on: null, genres: [] });
  });

  it("limits genres to eight", () => {
    expect(BookSchema.safeParse({ ...valid, genres: "a,b,c,d,e,f,g,h,i" }).success).toBe(false);
  });
});

describe("BookSchema spine colour", () => {
  it("accepts a palette colour, treats empty as automatic, rejects anything else", () => {
    const ok = BookSchema.safeParse({ ...valid, spine_color: "#9a3a3a" });
    expect(ok.success && ok.data.spine_color).toBe("#9a3a3a");
    const auto = BookSchema.safeParse({ ...valid, spine_color: "" });
    expect(auto.success && auto.data.spine_color).toBeNull();
    expect(BookSchema.safeParse({ ...valid, spine_color: "#123456" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, spine_color: "red; background:url(x)" }).success).toBe(false);
  });
});

describe("resolveThemes", () => {
  const mk = (id: string, at: string, color: string | null = null) => ({ id, created_at: at, spine_color: color });
  it("hands out different colours in the order books were added and honours manual picks", () => {
    const themes = resolveThemes([mk("b", "2026-02-01"), mk("a", "2026-01-01"), mk("c", "2026-03-01", "#37455e")]);
    expect(themes.get("a")!.c1).not.toBe(themes.get("b")!.c1);
    expect(themes.get("c")!.c1).toBe("#37455e");
  });
});

describe("BookSearchSchema", () => {
  it("needs at least 3 characters", () => {
    expect(BookSearchSchema.safeParse({ q: "su" }).success).toBe(false);
    expect(BookSearchSchema.safeParse({ q: "suc" }).success).toBe(true);
  });
});
