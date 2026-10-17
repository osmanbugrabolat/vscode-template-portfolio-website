import { requireAdmin } from "@/lib/server/auth";
import { BOOK_COLUMNS, type Book } from "@/lib/books/types";
import BooksEditor from "./BooksEditor";

export const metadata = { title: "Kütüphane" };

export default async function BooksPage() {
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from("books")
    .select(BOOK_COLUMNS)
    .order("finished_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error("Kitaplar yüklenemedi.");
  return (
    <div className="adm-page">
      <BooksEditor books={data as Book[]} />
    </div>
  );
}
