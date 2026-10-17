import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { getBooks } from "@/lib/books/data";
import { getLang, getSiteData } from "@/lib/cms/data";
import LibraryView from "./LibraryView";
import "./library.css";

const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap" });

// Not linked from the site on purpose: it is shared by address only.
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: lang === "en" ? "Digital Library" : "Dijital Kütüphane",
    description: lang === "en" ? "Books I have read." : "Okuduğum kitaplar.",
    robots: { index: false, follow: false },
  };
}

export default async function LibraryPage() {
  const [books, lang, { settings }] = await Promise.all([getBooks(), getLang(), getSiteData()]);
  return (
    <div className={serif.variable}>
      <LibraryView books={books} lang={lang} owner={settings.name} />
    </div>
  );
}
