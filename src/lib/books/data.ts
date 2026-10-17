import "server-only";
import { unstable_cache } from "next/cache";
import { CMS_TAG } from "@/lib/cms/data";
import { createPublicClient } from "@/lib/server/supabase";
import { BOOK_COLUMNS, type Book } from "./types";

async function loadBooks(): Promise<Book[]> {
  const { data, error } = await createPublicClient()
    .from("books")
    .select(BOOK_COLUMNS)
    .order("finished_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load books: ${error.message}`);
  return data as Book[];
}

/** Cached under the CMS tag, so admin edits and the database trigger refresh it. */
export const getBooks = unstable_cache(loadBooks, ["books-v1"], { tags: [CMS_TAG], revalidate: 3600 });
