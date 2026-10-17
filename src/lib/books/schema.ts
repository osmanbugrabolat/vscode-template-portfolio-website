import * as z from "zod";
import { emptyToNull, optionalHttpsUrl, singleLine, tagList, text, uuid } from "@/lib/validation";
import { THEME_COLORS } from "./appearance";
import { BOOK_STATUSES } from "./types";

const optionalDate = z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Geçerli bir tarih girin." }).nullable());

/** Comma separated genres; duplicates (ignoring case) are dropped. */
const genres = tagList(8, 40).transform((list) => list.filter((g, i) => list.findIndex((o) => o.toLocaleLowerCase("tr") === g.toLocaleLowerCase("tr")) === i));

const optionalInt = (min: number, max: number) =>
  z.preprocess(emptyToNull, z.coerce.number().int().min(min).max(max).nullable());

export const BookSchema = z.object({
  id: z.preprocess(emptyToNull, uuid.nullable()),
  title: singleLine(200, 1),
  author: singleLine(200),
  cover_url: optionalHttpsUrl,
  isbn: singleLine(20),
  published_year: optionalInt(0, 2200),
  page_count: optionalInt(1, 20000),
  description: text(4000),
  status: z.enum(BOOK_STATUSES),
  rating: optionalInt(1, 5),
  started_on: optionalDate,
  finished_on: optionalDate,
  genres,
  spine_color: z.preprocess(emptyToNull, z.enum(THEME_COLORS, { error: "Geçersiz renk." }).nullable()),
  notes: text(8000),
}).refine((v) => !v.started_on || !v.finished_on || v.started_on <= v.finished_on, {
  path: ["finished_on"],
  error: "Bitiş tarihi başlangıçtan önce olamaz.",
});

export const BookSearchSchema = z.object({ q: singleLine(100, 3) });
