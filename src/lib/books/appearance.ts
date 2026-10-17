import type { Book } from "./types";

/** Gradient pairs (and a readable text colour) for books without a cover image. */
const THEMES = [
  { c1: "#efe8d6", c2: "#c9bf9f", fg: "#1c1a15" },
  { c1: "#9a3a3a", c2: "#4a1818", fg: "#f4e4d4" },
  { c1: "#d99a3c", c2: "#7c4a10", fg: "#1d1408" },
  { c1: "#2c5470", c2: "#10222f", fg: "#e7eef3" },
  { c1: "#4f8a70", c2: "#1d3a2d", fg: "#e5f0ea" },
  { c1: "#e4dece", c2: "#b3ab93", fg: "#222222" },
  { c1: "#e1ae4b", c2: "#8b5c14", fg: "#201706" },
  { c1: "#74497e", c2: "#35193c", fg: "#f3e8f6" },
  { c1: "#3f63b0", c2: "#16275a", fg: "#e9eefb" },
  { c1: "#9a7a55", c2: "#4d3b26", fg: "#f7efe3" },
  { c1: "#37455e", c2: "#1c2332", fg: "#e2e8f0" },
] as const;

export type CoverTheme = (typeof THEMES)[number];

/** Stable 32-bit hash: the same book always gets the same colours and size. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function coverTheme(book: Pick<Book, "id" | "title">): CoverTheme {
  return THEMES[hash(`${book.title}${book.id}`) % THEMES.length];
}

/** Spine size in px: thicker with more pages, height varies a little per book. */
export function spineSize(book: Pick<Book, "id" | "title" | "page_count">): { width: number; height: number } {
  const h = hash(`${book.id}${book.title}`);
  const pages = book.page_count ?? 260 + (h % 200);
  return {
    width: Math.round(Math.min(64, Math.max(38, 30 + pages / 18))),
    height: 216 + (h % 7) * 11,
  };
}
