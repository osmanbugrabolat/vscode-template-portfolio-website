"use client";

import { useEffect, useMemo, useState } from "react";
import { VscBook, VscClose, VscSearch, VscStarFull } from "react-icons/vsc";
import type { Book, BookStatus } from "@/lib/books/types";

type Lang = "tr" | "en";
type Filter = "all" | BookStatus;

const T = {
  tr: {
    title: "Okuduklarım",
    intro: (owner: string) => `${owner} için kitaplık. Okuduğu, okumakta olduğu ve sırada bekleyen kitaplar.`,
    summary: (books: number, pages: number) => `${books} kitap, ${pages.toLocaleString("tr-TR")} sayfa okundu`,
    search: "Kitap ya da yazar ara",
    all: "Tümü",
    read: "Okudum",
    reading: "Okuyorum",
    want: "Okuyacağım",
    readingNow: "Şu an okuyorum",
    queue: "Sırada bekleyenler",
    undated: "Tarihsiz",
    empty: "Henüz kitap yok.",
    noMatch: "Aramanızla eşleşen kitap yok. Başka bir yazım deneyin.",
    notes: "Notlarım",
    summaryHeading: "Özet",
    pages: "sayfa",
    finished: "Bitirme tarihi",
    close: "Kapat",
  },
  en: {
    title: "Reading list",
    intro: (owner: string) => `${owner}'s bookshelf: finished, in progress and waiting in the queue.`,
    summary: (books: number, pages: number) => `${books} ${books === 1 ? "book" : "books"}, ${pages.toLocaleString("en-US")} pages read`,
    search: "Search by title or author",
    all: "All",
    read: "Read",
    reading: "Reading",
    want: "Want to read",
    readingNow: "Reading now",
    queue: "Up next",
    undated: "Undated",
    empty: "No books yet.",
    noMatch: "No books match your search. Try another spelling.",
    notes: "My notes",
    summaryHeading: "Summary",
    pages: "pages",
    finished: "Finished",
    close: "Close",
  },
} as const;

function Cover({ book, className }: { book: Book; className: string }) {
  return book.cover_url ? (
    // eslint-disable-next-line @next/next/no-img-element -- covers come from arbitrary book APIs
    <img className={className} src={book.cover_url} alt={book.title} loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <div className={`${className} lib-cover-empty`} role="img" aria-label={book.title}>
      <VscBook aria-hidden />
      <span>{book.title}</span>
    </div>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="lib-rating" role="img" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <VscStarFull key={i} className={i < value ? "is-on" : ""} aria-hidden />
      ))}
    </span>
  );
}

interface Section {
  key: string;
  title: string;
  kind: "reading" | "shelf";
  books: Book[];
}

export default function LibraryView({ books, lang, owner }: { books: Book[]; lang: Lang; owner: string }) {
  const t = T[lang];
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Book | null>(null);

  const stats = useMemo(() => {
    const read = books.filter((b) => b.status === "read");
    return { books: read.length, pages: read.reduce((sum, b) => sum + (b.page_count ?? 0), 0) };
  }, [books]);

  const counts = useMemo(
    () => ({ all: books.length, read: books.filter((b) => b.status === "read").length, reading: books.filter((b) => b.status === "reading").length, want: books.filter((b) => b.status === "want").length }),
    [books],
  );

  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const matches = books.filter((b) => (filter === "all" || b.status === filter) && (!q || `${b.title} ${b.author}`.toLocaleLowerCase(lang).includes(q)));
    const out: Section[] = [];
    const reading = matches.filter((b) => b.status === "reading");
    if (reading.length) out.push({ key: "reading", title: t.readingNow, kind: "reading", books: reading });

    // Finished books are grouped by the year they were finished (books arrive newest first).
    const byYear = new Map<string, Book[]>();
    for (const b of matches.filter((b) => b.status === "read")) {
      const year = b.finished_on?.slice(0, 4) ?? "";
      byYear.set(year, [...(byYear.get(year) ?? []), b]);
    }
    for (const [year, list] of byYear) out.push({ key: `y${year}`, title: year || t.undated, kind: "shelf", books: list });

    const want = matches.filter((b) => b.status === "want");
    if (want.length) out.push({ key: "want", title: t.queue, kind: "shelf", books: want });
    return out;
  }, [books, filter, query, lang, t]);

  const filters: Filter[] = ["all", "read", "reading", "want"];

  return (
    <main className="lib">
      <header className="lib-header">
        <h1>{t.title}</h1>
        <p className="lib-intro">{t.intro(owner)}</p>
        {stats.books > 0 && <p className="lib-summary">{t.summary(stats.books, stats.pages)}</p>}
      </header>

      <div className="lib-toolbar">
        <div className="lib-segment" role="tablist" aria-label="Filtre">
          {filters.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
              {t[f]}
              <span>{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="lib-search">
          <VscSearch aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
      </div>

      {sections.length === 0 ? (
        <p className="lib-empty">{books.length === 0 ? t.empty : t.noMatch}</p>
      ) : (
        sections.map((section) => (
          <section key={section.key} className="lib-section" aria-label={section.title}>
            <h2>
              {section.title}
              <span>{section.books.length}</span>
            </h2>
            {section.kind === "reading" ? (
              <ul className="lib-featured">
                {section.books.map((book) => (
                  <li key={book.id}>
                    <button type="button" className="lib-feature" onClick={() => setOpen(book)}>
                      <Cover book={book} className="lib-cover" />
                      <span className="lib-feature-text">
                        <span className="lib-feature-title">{book.title}</span>
                        {book.author && <span className="lib-author">{book.author}</span>}
                        {book.description && <span className="lib-feature-desc">{book.description}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="lib-grid">
                {section.books.map((book) => (
                  <li key={book.id}>
                    <button type="button" className="lib-card" onClick={() => setOpen(book)}>
                      <Cover book={book} className="lib-cover" />
                      <span className="lib-card-title">{book.title}</span>
                      {book.author && <span className="lib-author">{book.author}</span>}
                      {book.rating && <Rating value={book.rating} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}

      {open && <Drawer book={open} lang={lang} onClose={() => setOpen(null)} />}
    </main>
  );
}

function Drawer({ book, lang, onClose }: { book: Book; lang: Lang; onClose: () => void }) {
  const t = T[lang];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const finished = book.finished_on
    ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(book.finished_on))
    : null;
  const facts: [string, string][] = [
    ...(book.published_year ? ([[lang === "en" ? "Year" : "Basım yılı", String(book.published_year)]] as [string, string][]) : []),
    ...(book.page_count ? ([[t.pages, String(book.page_count)]] as [string, string][]) : []),
    ...(finished ? ([[t.finished, finished]] as [string, string][]) : []),
  ];

  return (
    <div className="lib-overlay" onClick={onClose}>
      <aside className="lib-drawer" role="dialog" aria-modal="true" aria-label={book.title} onClick={(e) => e.stopPropagation()}>
        {book.cover_url && <div className="lib-drawer-glow" style={{ backgroundImage: `url("${book.cover_url.replace(/"/g, "%22")}")` }} aria-hidden />}
        <button type="button" className="lib-close" onClick={onClose} aria-label={t.close} autoFocus>
          <VscClose />
        </button>
        <div className="lib-drawer-scroll">
          <Cover book={book} className="lib-drawer-cover" />
          <h2>{book.title}</h2>
          {book.author && <p className="lib-author lib-drawer-author">{book.author}</p>}
          <div className="lib-drawer-status">
            <span className={`lib-status lib-status-${book.status}`}>{t[book.status]}</span>
            {book.rating && <Rating value={book.rating} />}
          </div>
          {facts.length > 0 && (
            <dl className="lib-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {book.notes && (
            <>
              <h3>{t.notes}</h3>
              <p className="lib-prose">{book.notes}</p>
            </>
          )}
          {book.description && (
            <>
              <h3>{t.summaryHeading}</h3>
              <p className="lib-prose lib-prose-muted">{book.description}</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
