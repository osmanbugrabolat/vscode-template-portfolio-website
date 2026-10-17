import type { Metadata } from "next";
import { getBooks } from "@/lib/books/data";
import { getLang, getSiteData } from "@/lib/cms/data";
import LibraryView from "./LibraryView";
import "./library.css";

// Not linked from the site on purpose: it is shared by address only.
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: lang === "en" ? "Online Library" : "Online Kütüphanem",
    description: lang === "en" ? "Books I have read." : "Okuduğum kitaplar.",
    robots: { index: false, follow: false },
  };
}

export default async function LibraryPage() {
  const [books, lang, { settings }] = await Promise.all([getBooks(), getLang(), getSiteData()]);
  return <LibraryView books={books} lang={lang} owner={settings.name} />;
}
