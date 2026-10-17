import "server-only";
import { serverEnv } from "@/lib/server/env";
import type { BookSuggestion } from "./types";

/**
 * Book lookup against two free APIs. Open Library needs no key and supports
 * prefix matching (so 3-4 typed letters already find books). Google Books is
 * better for Turkish titles, but without GOOGLE_BOOKS_API_KEY it shares an
 * anonymous quota that is often exhausted. Either may fail, so a failure of
 * one never hides the other's results.
 */

const TIMEOUT_MS = 5000;

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`lookup failed: ${res.status}`);
  return res.json();
}

/** Strips tags and entities from Google's HTML descriptions. */
function plain(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<br\s*\/?>|<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null);

/** Google gives paths like "Fiction / Classics": keep each distinct part, at most three. */
function genresFrom(categories: string[] | undefined): string[] {
  const parts = (categories ?? []).flatMap((c) => c.split("/")).map((c) => c.trim()).filter((c) => c && c.length <= 40);
  return [...new Set(parts)].slice(0, 3);
}

interface GoogleVolume {
  id?: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type?: string; identifier?: string }[];
    categories?: string[];
  };
}

async function searchGoogle(q: string): Promise<BookSuggestion[]> {
  const key = serverEnv.googleBooksApiKey;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&printType=books${key ? `&key=${encodeURIComponent(key)}` : ""}`;
  const body = (await getJson(url)) as { items?: GoogleVolume[] };
  return (body.items ?? []).flatMap((item) => {
    const v = item.volumeInfo;
    if (!v?.title) return [];
    const thumb = v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail ?? "";
    const cover = thumb ? thumb.replace(/^http:/, "https:").replace("&edge=curl", "").replace("zoom=1", "zoom=2") : "";
    const ids = v.industryIdentifiers ?? [];
    const isbn = ids.find((i) => i.type === "ISBN_13")?.identifier ?? ids.find((i) => i.type === "ISBN_10")?.identifier ?? "";
    const year = Number.parseInt(v.publishedDate ?? "", 10);
    return [
      {
        key: `g:${item.id ?? v.title}`,
        title: str(v.subtitle ? `${v.title}: ${v.subtitle}` : v.title, 200),
        author: str((v.authors ?? []).join(", "), 200),
        cover_url: cover.length <= 2000 ? cover : "",
        isbn: str(isbn, 20),
        published_year: Number.isInteger(year) && year > 0 ? year : null,
        page_count: int(v.pageCount),
        description: plain(v.description, 4000),
        genres: genresFrom(v.categories),
      },
    ];
  });
}

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
}

/** "suc ve ce" -> title:(suc ve ce*) OR author:(suc ve ce*): the last word matches as a prefix. */
function openLibraryQuery(q: string): string | null {
  const words = q.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, " ").split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const terms = `${words.join(" ")}*`;
  return `title:(${terms}) OR author:(${terms})`;
}

async function searchOpenLibrary(q: string): Promise<BookSuggestion[]> {
  const query = openLibraryQuery(q);
  if (!query) return [];
  const fields = "key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=${fields}`;
  const body = (await getJson(url)) as { docs?: OpenLibraryDoc[] };
  return (body.docs ?? []).flatMap((d) => {
    if (!d.title) return [];
    return [
      {
        key: `o:${d.key ?? d.title}`,
        title: str(d.title, 200),
        author: str((d.author_name ?? []).slice(0, 3).join(", "), 200),
        cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : "",
        isbn: str(d.isbn?.find((i) => i.length === 13) ?? d.isbn?.[0], 20),
        published_year: int(d.first_publish_year),
        page_count: int(d.number_of_pages_median),
        description: "",
        genres: [],
      },
    ];
  });
}

export async function searchBooks(q: string): Promise<BookSuggestion[]> {
  const [google, open] = await Promise.allSettled([searchGoogle(q), searchOpenLibrary(q)]);
  if (google.status === "rejected" && open.status === "rejected") throw new Error("Kitap arama servisleri yanıt vermedi.");
  const merged = [...(google.status === "fulfilled" ? google.value : []), ...(open.status === "fulfilled" ? open.value : [])];

  // Same book from both sources: keep the first (Google, with description) and borrow a missing cover.
  const seen = new Map<string, BookSuggestion>();
  for (const b of merged) {
    const id = `${b.title.toLowerCase()}|${b.author.toLowerCase()}`;
    const existing = seen.get(id);
    if (!existing) seen.set(id, b);
    else if (!existing.cover_url && b.cover_url) existing.cover_url = b.cover_url;
  }
  // Results with a cover first: that is what makes picking by sight easy.
  return [...seen.values()].sort((a, b) => Number(!!b.cover_url) - Number(!!a.cover_url)).slice(0, 10);
}
