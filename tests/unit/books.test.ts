import { describe, expect, it } from "vitest";
import { BookSchema, BookSearchSchema } from "@/lib/books/schema";

const valid = { id: "", title: "Suç ve Ceza", author: "Dostoyevski", cover_url: "https://covers.openlibrary.org/b/id/1-L.jpg", isbn: "", published_year: "1866", page_count: "", description: "", status: "read", rating: "5", finished_on: "2026-10-01", notes: "" };

describe("BookSchema", () => {
  it("accepts a form submission and turns empty numbers into null", () => {
    const r = BookSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ id: null, published_year: 1866, page_count: null, rating: 5 });
  });

  it("rejects bad status, rating, cover url and emoji", () => {
    expect(BookSchema.safeParse({ ...valid, status: "owned" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, cover_url: "javascript:alert(1)" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, cover_url: "http://example.com/a.jpg" }).success).toBe(false);
    expect(BookSchema.safeParse({ ...valid, title: "Kitap 📚" }).success).toBe(false);
  });
});

describe("BookSearchSchema", () => {
  it("needs at least 3 characters", () => {
    expect(BookSearchSchema.safeParse({ q: "su" }).success).toBe(false);
    expect(BookSearchSchema.safeParse({ q: "suc" }).success).toBe(true);
  });
});
