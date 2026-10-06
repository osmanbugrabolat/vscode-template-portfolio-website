import type { Metadata } from "next";
import VSCodeLayout from "@/components/layout/VSCodeLayout";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import "./site.css";
import { getLang, getSiteData, toExplorerItems } from "@/lib/cms/data";
import { pick } from "@/lib/cms/types";

export async function generateMetadata(): Promise<Metadata> {
  const [{ settings }, lang] = await Promise.all([getSiteData(), getLang()]);
  const title = settings.seo_title || settings.name;
  const description = pick(settings.seo_description_tr, settings.seo_description_en, lang);
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [data, lang] = await Promise.all([getSiteData(), getLang()]);
  const s = data.settings;
  return (
    <LanguageProvider initialLanguage={lang}>
      <VSCodeLayout
        items={toExplorerItems(data.nodes)}
        skillCategories={data.skillCategories}
        settings={{
          name: s.name,
          email: s.email,
          github_url: s.github_url,
          linkedin_url: s.linkedin_url,
          medium_url: s.medium_url,
          terminal_whoami: s.terminal_whoami,
          chat_greeting_tr: s.chat_greeting_tr,
          chat_greeting_en: s.chat_greeting_en,
        }}
      >
        {children}
      </VSCodeLayout>
    </LanguageProvider>
  );
}
