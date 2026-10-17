import type { Book } from "./types";

/**
 * Shelf / cover colours: a gradient pair plus a readable text colour.
 * `c1` doubles as the stored id when the owner picks a colour in the admin panel.
 */
export const THEMES = [
  { name: "Krem", c1: "#efe8d6", c2: "#c9bf9f", fg: "#1c1a15" },
  { name: "Bordo", c1: "#9a3a3a", c2: "#4a1818", fg: "#f4e4d4" },
  { name: "Kehribar", c1: "#d99a3c", c2: "#7c4a10", fg: "#1d1408" },
  { name: "Petrol", c1: "#2c5470", c2: "#10222f", fg: "#e7eef3" },
  { name: "Yeşil", c1: "#4f8a70", c2: "#1d3a2d", fg: "#e5f0ea" },
  { name: "Kum", c1: "#e4dece", c2: "#b3ab93", fg: "#222222" },
  { name: "Hardal", c1: "#e1ae4b", c2: "#8b5c14", fg: "#201706" },
  { name: "Mor", c1: "#74497e", c2: "#35193c", fg: "#f3e8f6" },
  { name: "Mavi", c1: "#3f63b0", c2: "#16275a", fg: "#e9eefb" },
  { name: "Kahve", c1: "#9a7a55", c2: "#4d3b26", fg: "#f7efe3" },
  { name: "Arduvaz", c1: "#37455e", c2: "#1c2332", fg: "#e2e8f0" },
] as const;

export type CoverTheme = (typeof THEMES)[number];

export const THEME_COLORS = THEMES.map((t) => t.c1) as [string, ...string[]];

/**
 * A theme for every book: the colour the owner picked, else the next palette
 * colour in the order books were added. Handing colours out in turn means
 * neighbours differ (a hash of the title would collide on small shelves).
 */
export function resolveThemes(books: Pick<Book, "id" | "created_at" | "spine_color">[]): Map<string, CoverTheme> {
  const byAdded = [...books].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  const out = new Map<string, CoverTheme>();
  byAdded.forEach((book, i) => {
    const chosen = THEMES.find((t) => t.c1 === book.spine_color);
    out.set(book.id, chosen ?? THEMES[i % THEMES.length]);
  });
  return out;
}

/** Stable 32-bit hash: the same book always gets the same spine height. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Spine size: thicker with more pages (px width); height is a share of the shelf
 * height (0.76 to 1.0) so the shelf can scale with the screen.
 */
export function spineSize(book: Pick<Book, "id" | "title" | "page_count">): { width: number; heightRatio: number } {
  const h = hash(`${book.id}${book.title}`);
  const pages = book.page_count ?? 260 + (h % 200);
  return {
    width: Math.round(Math.min(64, Math.max(38, 30 + pages / 18))),
    heightRatio: 0.76 + (h % 7) * 0.04,
  };
}
