"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { VscAdd, VscEdit, VscLibrary, VscSearch, VscTrash } from "react-icons/vsc";
import { BOOK_STATUS_LABELS, BOOK_STATUSES, type Book, type BookStatus, type BookSuggestion } from "@/lib/books/types";
import { deleteBook, lookupBooks, saveBook } from "../_actions/books";
import { DeleteButton, FormError, PageHeader, SelectField, SubmitButton, TextAreaField, TextField, useAdminAction, useToast } from "../_components/ui";

export default function BooksEditor({ books }: { books: Book[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const close = () => setEditing(null);

  return (
    <>
      <PageHeader
        title="Kütüphane"
        icon={<VscLibrary aria-hidden />}
        description={
          <>
            Okuduğunuz kitaplar <code>/online-kutuphanem</code> adresinde görünür. Sitede bu sayfaya giden bir bağlantı yoktur; adresi bilenler açabilir.
          </>
        }
        actions={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditing("new")}>
            <VscAdd aria-hidden /> Kitap ekle
          </button>
        }
      />

      {editing === "new" && (
        <div className="adm-card">
          <BookForm onDone={close} />
        </div>
      )}

      {books.length === 0 && editing !== "new" && <div className="adm-card adm-empty">Henüz kitap eklenmedi.</div>}

      {books.length > 0 && (
        <section className="adm-card">
          <ul className="adm-list">
            {books.map((book) =>
              editing === book.id ? (
                <li key={book.id} className="adm-list-item" style={{ display: "block" }}>
                  <BookForm book={book} onDone={close} />
                </li>
              ) : (
                <li key={book.id} className="adm-list-item">
                  <BookThumb url={book.cover_url} title={book.title} />
                  <div className="adm-list-main">
                    <div className="adm-list-title">
                      {book.title}
                      <span className="adm-badge">{BOOK_STATUS_LABELS[book.status]}</span>
                    </div>
                    <div className="adm-help">
                      {[book.author, book.published_year, book.rating ? `${book.rating}/5` : null].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="adm-btn-group">
                    <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" aria-label="Düzenle" title="Düzenle" onClick={() => setEditing(book.id)}>
                      <VscEdit />
                    </button>
                    <DeleteButton action={deleteBook} fields={{ id: book.id }} title="Kitap silinsin mi?" message={`"${book.title}" kütüphaneden silinecek.`} iconOnly={<VscTrash />} />
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </>
  );
}

function BookThumb({ url, title }: { url: string; title: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- covers come from arbitrary book APIs
    <img className="adm-book-cover" src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <span className="adm-book-cover adm-book-cover-empty" aria-label={`${title} için kapak yok`}>
      <VscLibrary aria-hidden />
    </span>
  );
}

interface Draft {
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  published_year: string;
  page_count: string;
  description: string;
}

function BookForm({ book, onDone }: { book?: Book; onDone: () => void }) {
  const { state, onSubmit, pending, errors } = useAdminAction(saveBook, { onSuccess: onDone });
  const [draft, setDraft] = useState<Draft>({
    title: book?.title ?? "",
    author: book?.author ?? "",
    cover_url: book?.cover_url ?? "",
    isbn: book?.isbn ?? "",
    published_year: book?.published_year?.toString() ?? "",
    page_count: book?.page_count?.toString() ?? "",
    description: book?.description ?? "",
  });
  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const pick = (s: BookSuggestion) =>
    setDraft({
      title: s.title,
      author: s.author,
      cover_url: s.cover_url,
      isbn: s.isbn,
      published_year: s.published_year?.toString() ?? "",
      page_count: s.page_count?.toString() ?? "",
      description: s.description,
    });

  return (
    <form onSubmit={onSubmit} className="adm-card-body adm-form">
      <FormError state={state} />
      <input type="hidden" name="id" value={book?.id ?? ""} />
      <input type="hidden" name="cover_url" value={draft.cover_url} />

      <BookLookup onPick={pick} />

      <div className="adm-book-form">
        <div className="adm-book-preview">
          <BookThumb url={draft.cover_url} title={draft.title || "Yeni kitap"} />
          {draft.cover_url && (
            <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setDraft((d) => ({ ...d, cover_url: "" }))}>
              Kapağı kaldır
            </button>
          )}
        </div>
        <div className="adm-form" style={{ flex: 1, minWidth: 0 }}>
          <div className="adm-form-grid">
            <TextField label="Kitap adı" name="title" value={draft.title} onChange={set("title")} required maxLength={200} errors={errors} />
            <TextField label="Yazar" name="author" value={draft.author} onChange={set("author")} maxLength={200} errors={errors} />
            <TextField label="Kapak adresi" hint="https://" value={draft.cover_url} onChange={set("cover_url")} maxLength={2000} errors={errors} help="Aramadan gelir; isterseniz kendi görsel adresinizi yapıştırabilirsiniz." />
            <TextField label="ISBN" name="isbn" value={draft.isbn} onChange={set("isbn")} maxLength={20} mono errors={errors} />
            <TextField label="Basım yılı" name="published_year" type="number" value={draft.published_year} onChange={set("published_year")} min={0} max={2200} errors={errors} />
            <TextField label="Sayfa sayısı" name="page_count" type="number" value={draft.page_count} onChange={set("page_count")} min={1} max={20000} errors={errors} />
          </div>
        </div>
      </div>

      <div className="adm-form-grid">
        <SelectField label="Durum" name="status" defaultValue={book?.status ?? "read"} errors={errors}>
          {BOOK_STATUSES.map((s: BookStatus) => (
            <option key={s} value={s}>
              {BOOK_STATUS_LABELS[s]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Puan" name="rating" defaultValue={book?.rating?.toString() ?? ""} errors={errors}>
          <option value="">Puansız</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </SelectField>
        <TextField label="Bitirme tarihi" name="finished_on" type="date" defaultValue={book?.finished_on ?? ""} errors={errors} />
      </div>
      <TextAreaField label="Özet" name="description" value={draft.description} onChange={set("description")} rows={4} maxLength={4000} errors={errors} />
      <TextAreaField label="Notlarım" name="notes" defaultValue={book?.notes} rows={4} maxLength={8000} errors={errors} help="Kitap hakkındaki kişisel düşünceleriniz; sayfada görünür." />

      <div className="adm-form-actions">
        <SubmitButton pending={pending}>{book ? "Kaydet" : "Kitabı ekle"}</SubmitButton>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onDone}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}

/** Type 3+ letters, pick a result: fills the form from Google Books / Open Library. */
function BookLookup({ onPick }: { onPick: (s: BookSuggestion) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const latest = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const ticket = ++latest.current;
    const timer = setTimeout(() => {
      const fd = new FormData();
      fd.set("q", q);
      startTransition(async () => {
        const res = await lookupBooks(undefined, fd);
        // A slower, older request must not overwrite newer results.
        if (ticket !== latest.current) return;
        if (res.ok) {
          setResults(res.data ?? []);
          setError(null);
        } else {
          setResults(null);
          setError(res.error);
        }
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  const visible = query.trim().length >= 3;

  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor="book-lookup">
        <VscSearch aria-hidden /> Kitap ara
        <span className="adm-label-hint">ad ya da yazar, en az 3 harf</span>
      </label>
      <input
        id="book-lookup"
        className="adm-input"
        type="search"
        autoComplete="off"
        placeholder="Örn: suç ve ce"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        autoFocus
      />
      {visible && (
        <div className="adm-book-results" role="listbox" aria-label="Kitap sonuçları" aria-busy={loading}>
          {error && <p className="adm-help">{error}</p>}
          {!error && loading && !results && <p className="adm-help">Aranıyor...</p>}
          {!error && results?.length === 0 && !loading && <p className="adm-help">Sonuç bulunamadı. Bilgileri elle girebilirsiniz.</p>}
          {!error &&
            results?.map((s) => (
              <button
                key={s.key}
                type="button"
                role="option"
                aria-selected={false}
                className="adm-book-result"
                onClick={() => {
                  onPick(s);
                  setQuery("");
                  setResults(null);
                  toast("info", "Bilgiler forma aktarıldı. Durum ve puanı seçip kaydedin.");
                }}
              >
                {s.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- covers come from arbitrary book APIs
                  <img className="adm-book-cover" src={s.cover_url} alt="" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <span className="adm-book-cover adm-book-cover-empty">
                    <VscLibrary aria-hidden />
                  </span>
                )}
                <span>
                  <strong>{s.title}</strong>
                  <small>{[s.author, s.published_year].filter(Boolean).join(" · ")}</small>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
