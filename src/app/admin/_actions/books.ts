"use server";

import * as z from "zod";
import { BookSchema, BookSearchSchema } from "@/lib/books/schema";
import { searchBooks } from "@/lib/books/search";
import type { BookSuggestion } from "@/lib/books/types";
import { adminAction, ActionError, invalidate, requireRow, type ActionResult } from "@/lib/server/admin-action";
import { uuid } from "@/lib/validation";

const saveBookImpl = adminAction({
  schema: BookSchema,
  audit: { action: "save", entity: "book" },
  run: async ({ id, ...row }, { db }) => {
    if (id) {
      requireRow(await db.from("books").update(row).eq("id", id).select("id").single());
      invalidate("cms");
      return { entityId: id, message: "Kitap kaydedildi." };
    }
    const created = requireRow(await db.from("books").insert(row).select("id").single());
    invalidate("cms");
    return { entityId: created.id, message: "Kitap eklendi." };
  },
});

const deleteBookImpl = adminAction({
  schema: z.object({ id: uuid }),
  audit: { action: "delete", entity: "book" },
  run: async ({ id }, { db }) => {
    const deleted = requireRow(await db.from("books").delete().eq("id", id).select("id"));
    if (!deleted.length) throw new ActionError("Kayıt bulunamadı.");
    invalidate("cms");
    return { entityId: id, message: "Kitap silindi." };
  },
});

/** Admin-only proxy to the book APIs, so the browser never talks to them directly. */
const searchBooksImpl = adminAction<typeof BookSearchSchema, BookSuggestion[]>({
  schema: BookSearchSchema,
  audit: false,
  run: async ({ q }) => {
    try {
      return { data: await searchBooks(q) };
    } catch (e) {
      console.warn("[books] lookup failed:", e instanceof Error ? e.message : e);
      throw new ActionError("Kitap arama servisleri şu an yanıt vermiyor. Bilgileri elle girebilirsiniz.");
    }
  },
});

type R<T = undefined> = ActionResult<T> | undefined;
export async function saveBook(prev: R, fd: FormData) { return saveBookImpl(prev, fd); }
export async function deleteBook(prev: R, fd: FormData) { return deleteBookImpl(prev, fd); }
export async function lookupBooks(prev: R<BookSuggestion[]>, fd: FormData) { return searchBooksImpl(prev, fd); }
