"use client";

import { useEffect, useMemo, useState } from "react";
import { VscBook, VscClose, VscFilter, VscSearch, VscStarFull } from "react-icons/vsc";
import type { Book, BookStatus } from "@/lib/books/types";

type Lang = "tr" | "en";
type Filter = "all" | BookStatus;

const T = {
  tr: {
    title: "Okuduklarım",
    intro: (owner: string) => `${owner}'ın dijital kütüphanesi. Okuduğu, okumakta olduğu ve sırada bekleyen kitaplar.`,
    search: "Kitap ya da yazar ara",
    filters: "Filtreler",
    status: "Durum",
    genre: "Tür",
    author: "Yazar",
    clear: "Filtreleri temizle",
    showAll: "Tümünü göster",
    showLess: "Daha az göster",
    started: "Başlangıç",
    duration: "Okuma süresi",
    days: (n: number) => `${n} gün`,
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
    intro: (owner: string) => `${owner}'s digital library. Books finished, in progress and waiting in the queue.`,
    search: "Search by title or author",
    filters: "Filters",
    status: "Status",
    genre: "Genre",
    author: "Author",
    clear: "Clear filters",
    showAll: "Show all",
    showLess: "Show less",
    started: "Started",
    duration: "Reading time",
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
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

/** "A, B" is two authors for filtering purposes. */
function authorsOf(book: Book): string[] {
  return [...new Set(book.author.split(",").map((a) => a.trim()).filter(Boolean))];
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="lib-group">
      <h3>{title}</h3>
      <ul>{children}</ul>
    </section>
  );
}

function FilterItem({ active, count, onClick, children }: { active: boolean; count: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button type="button" className="lib-filter" aria-pressed={active} onClick={onClick}>
        <span>{children}</span>
        <span className="lib-filter-count">{count}</span>
      </button>
    </li>
  );
}

const FACET_LIMIT = 8;

function FacetList({ items, selected, onSelect, t }: { items: [string, number][]; selected: string | null; onSelect: (v: string | null) => void; t: (typeof T)[Lang] }) {
  const [expanded, setExpanded] = useState(false);
  // A selected value stays visible even when it falls outside the collapsed list.
  const visible = expanded ? items : items.filter(([name], i) => i < FACET_LIMIT || name === selected);
  return (
    <>
      {visible.map(([name, count]) => (
        <FilterItem key={name} active={selected === name} count={count} onClick={() => onSelect(selected === name ? null : name)}>
          {name}
        </FilterItem>
      ))}
      {items.length > FACET_LIMIT && (
        <li>
          <button type="button" className="lib-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? t.showLess : t.showAll}
          </button>
        </li>
      )}
    </>
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
  const [genre, setGenre] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [open, setOpen] = useState<Book | null>(null);

  const counts = useMemo(
    () => ({ all: books.length, read: books.filter((b) => b.status === "read").length, reading: books.filter((b) => b.status === "reading").length, want: books.filter((b) => b.status === "want").length }),
    [books],
  );

  // Facet counts follow the other active filters, so a choice never leads to an empty result.
  const facets = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const base = (skip: "genre" | "author") =>
      books.filter(
        (b) =>
          (filter === "all" || b.status === filter) &&
          (!q || `${b.title} ${b.author}`.toLocaleLowerCase(lang).includes(q)) &&
          (skip === "genre" || !genre || b.genres.includes(genre)) &&
          (skip === "author" || !author || authorsOf(b).includes(author)),
      );
    const tally = (values: string[][]) => {
      const m = new Map<string, number>();
      for (const list of values) for (const v of list) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], lang));
    };
    return { genres: tally(base("genre").map((b) => b.genres)), authors: tally(base("author").map(authorsOf)) };
  }, [books, filter, query, genre, author, lang]);

  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const matches = books.filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        (!q || `${b.title} ${b.author}`.toLocaleLowerCase(lang).includes(q)) &&
        (!genre || b.genres.includes(genre)) &&
        (!author || authorsOf(b).includes(author)),
    );
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
  }, [books, filter, query, genre, author, lang, t]);

  const hasFilters = filter !== "all" || !!query || !!genre || !!author;
  const clearFilters = () => {
    setFilter("all");
    setQuery("");
    setGenre(null);
    setAuthor(null);
  };

  const filters: Filter[] = ["all", "read", "reading", "want"];

  return (
    <main className="lib">
      <header className="lib-header">
        <h1>{t.title}</h1>
        <p className="lib-intro">{t.intro(owner)}</p>
      </header>

      <div className="lib-layout">
        <button type="button" className="lib-filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
          <VscFilter aria-hidden /> {t.filters}
          {hasFilters && <span className="lib-dot" aria-hidden />}
        </button>

        <aside className={`lib-sidebar${filtersOpen ? " is-open" : ""}`} aria-label={t.filters}>
          <label className="lib-search">
            <VscSearch aria-hidden />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
          </label>

          <FilterGroup title={t.status}>
            {filters.map((f) => (
              <FilterItem key={f} active={filter === f} count={counts[f]} onClick={() => setFilter(f)}>
                {t[f]}
              </FilterItem>
            ))}
          </FilterGroup>

          {facets.genres.length > 0 && (
            <FilterGroup title={t.genre}>
              <FacetList items={facets.genres} selected={genre} onSelect={setGenre} t={t} />
            </FilterGroup>
          )}
          {facets.authors.length > 0 && (
            <FilterGroup title={t.author}>
              <FacetList items={facets.authors} selected={author} onSelect={setAuthor} t={t} />
            </FilterGroup>
          )}

          {hasFilters && (
            <button type="button" className="lib-clear" onClick={clearFilters}>
              {t.clear}
            </button>
          )}
        </aside>

        <div className="lib-content">
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
        </div>
      </div>

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

  const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(d)) : null);
  const days = book.started_on && book.finished_on ? Math.round((Date.parse(book.finished_on) - Date.parse(book.started_on)) / 86_400_000) + 1 : null;
  const facts = (
    [
      [t.started, fmt(book.started_on)],
      [t.finished, fmt(book.finished_on)],
      [t.duration, days ? t.days(days) : null],
      [lang === "en" ? "Year" : "Basım yılı", book.published_year ? String(book.published_year) : null],
      [t.pages, book.page_count ? String(book.page_count) : null],
    ] as [string, string | null][]
  ).filter((f): f is [string, string] => f[1] !== null);

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
          {book.genres.length > 0 && (
            <ul className="lib-genres">
              {book.genres.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
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
