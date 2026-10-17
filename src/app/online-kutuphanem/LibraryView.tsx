"use client";

import { useMemo, useState } from "react";
import { VscBook, VscLibrary, VscSearch, VscStarFull } from "react-icons/vsc";
import type { Book, BookStatus } from "@/lib/books/types";

type Lang = "tr" | "en";
type Filter = "all" | BookStatus;

const T = {
  tr: {
    title: "Online Kütüphanem",
    sub: (owner: string) => `${owner} tarafından okunan kitaplar`,
    search: "Kitap ya da yazar ara",
    all: "Tümü",
    read: "Okudum",
    reading: "Okuyorum",
    want: "Okuyacağım",
    empty: "Henüz kitap yok.",
    noMatch: "Aramanızla eşleşen kitap yok.",
    notes: "Notlarım",
    pages: "sayfa",
    finished: "Bitirdi",
    count: (n: number) => `${n} kitap`,
    close: "Kapat",
  },
  en: {
    title: "Online Library",
    sub: (owner: string) => `Books read by ${owner}`,
    search: "Search by title or author",
    all: "All",
    read: "Read",
    reading: "Reading",
    want: "Want to read",
    empty: "No books yet.",
    noMatch: "No books match your search.",
    notes: "My notes",
    pages: "pages",
    finished: "Finished",
    count: (n: number) => `${n} ${n === 1 ? "book" : "books"}`,
    close: "Close",
  },
} as const;

function Cover({ book, className }: { book: Book; className: string }) {
  return book.cover_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- covers come from arbitrary book APIs
    <img className={className} src={book.cover_url} alt={book.title} loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <div className={`${className} lib-cover-empty`} aria-label={book.title}>
      <VscBook aria-hidden />
      <span>{book.title}</span>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="lib-stars" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <VscStarFull key={i} className={i < value ? "is-on" : ""} aria-hidden />
      ))}
    </span>
  );
}

export default function LibraryView({ books, lang, owner }: { books: Book[]; lang: Lang; owner: string }) {
  const t = T[lang];
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Book | null>(null);

  const counts = useMemo(
    () => ({ all: books.length, read: books.filter((b) => b.status === "read").length, reading: books.filter((b) => b.status === "reading").length, want: books.filter((b) => b.status === "want").length }),
    [books],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return books.filter((b) => (filter === "all" || b.status === filter) && (!q || `${b.title} ${b.author}`.toLocaleLowerCase(lang).includes(q)));
  }, [books, filter, query, lang]);

  const filters: Filter[] = ["all", "read", "reading", "want"];

  return (
    <main className="lib">
      <header className="lib-header">
        <h1>
          <VscLibrary aria-hidden /> {t.title}
        </h1>
        <p>{t.sub(owner)}</p>
      </header>

      <div className="lib-toolbar">
        <div className="lib-tabs" role="tablist">
          {filters.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? "is-active" : ""} onClick={() => setFilter(f)}>
              {t[f]} <span>{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="lib-search">
          <VscSearch aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="lib-empty">{books.length === 0 ? t.empty : t.noMatch}</p>
      ) : (
        <>
          <p className="lib-count">{t.count(shown.length)}</p>
          <ul className="lib-grid">
            {shown.map((book) => (
              <li key={book.id}>
                <button type="button" className="lib-card" onClick={() => setOpen(book)}>
                  <Cover book={book} className="lib-cover" />
                  <span className="lib-card-title">{book.title}</span>
                  {book.author && <span className="lib-card-author">{book.author}</span>}
                  {book.rating && <Stars value={book.rating} />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {open && <Detail book={open} lang={lang} onClose={() => setOpen(null)} />}
    </main>
  );
}

function Detail({ book, lang, onClose }: { book: Book; lang: Lang; onClose: () => void }) {
  const t = T[lang];
  const meta = [
    book.author,
    book.published_year,
    book.page_count ? `${book.page_count} ${t.pages}` : null,
    book.finished_on ? `${t.finished}: ${new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(book.finished_on))}` : null,
  ].filter(Boolean);
  return (
    <div className="lib-modal" role="dialog" aria-modal="true" aria-label={book.title} onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="lib-modal-body" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lib-close" onClick={onClose} aria-label={t.close} autoFocus>
          &times;
        </button>
        <Cover book={book} className="lib-detail-cover" />
        <div className="lib-detail">
          <h2>{book.title}</h2>
          <p className="lib-meta">{meta.join(" · ")}</p>
          <p className="lib-status">
            <span className={`lib-pill lib-pill-${book.status}`}>{t[book.status]}</span>
            {book.rating && <Stars value={book.rating} />}
          </p>
          {book.description && <p className="lib-text">{book.description}</p>}
          {book.notes && (
            <>
              <h3>{t.notes}</h3>
              <p className="lib-text">{book.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
