export const BOOK_STATUSES = ["read", "reading", "want"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  read: "Okudum",
  reading: "Okuyorum",
  want: "Okuyacağım",
};

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  published_year: number | null;
  page_count: number | null;
  description: string;
  status: BookStatus;
  rating: number | null;
  finished_on: string | null;
  notes: string;
  created_at: string;
}

export const BOOK_COLUMNS = "id, title, author, cover_url, isbn, published_year, page_count, description, status, rating, finished_on, notes, created_at";

/** One suggestion from the book lookup in the admin panel. */
export interface BookSuggestion {
  key: string;
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  published_year: number | null;
  page_count: number | null;
  description: string;
}
