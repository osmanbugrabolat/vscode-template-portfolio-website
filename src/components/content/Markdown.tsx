import Link from "next/link";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { VscLinkExternal, VscMail } from "react-icons/vsc";
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa";
import type { Lang } from "@/lib/chatbot/types";
import { pick, type SiteSettings, type SkillCategory } from "@/lib/cms/types";

export const WIDGETS = ["profile-header", "current-focus", "tech-stack", "contact-details", "social-links"] as const;
export type Widget = (typeof WIDGETS)[number];
const WIDGET_LINE = /^\{\{([a-z-]+)\}\}$/;

export interface MarkdownContext {
  lang: Lang;
  settings: SiteSettings;
  skillCategories: SkillCategory[];
}

/** Only http(s), mailto, in-page anchors and site-relative paths survive. */
export function safeUrl(url: string): string {
  const cleaned = defaultUrlTransform(url);
  if (!cleaned) return "";
  if (/^(https?:|mailto:)/i.test(cleaned) || cleaned.startsWith("/") || cleaned.startsWith("#")) {
    return cleaned.startsWith("//") ? "" : cleaned;
  }
  return "";
}

const components: Components = {
  a: ({ href, children }) => {
    const url = href ?? "";
    if (url.startsWith("/") && !url.startsWith("//")) return <Link href={url}>{children}</Link>;
    if (!url) return <span>{children}</span>;
    const external = /^https?:/i.test(url);
    return (
      <a href={url} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => (typeof src === "string" && src ? <img src={src} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" /> : null),
};

function MarkdownBlock({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrl} components={components} skipHtml>
      {source}
    </ReactMarkdown>
  );
}

const T = {
  hi: { tr: "Merhaba, ben", en: "Hi, I'm" },
  email: { tr: "E-posta", en: "Email" },
  location: { tr: "Konum", en: "Location" },
  linkedin: { tr: "LinkedIn Profili", en: "LinkedIn Profile" },
  github: { tr: "GitHub Depoları", en: "GitHub Repositories" },
  medium: { tr: "Medium Yazıları", en: "Medium Articles" },
};

function WidgetView({ widget, ctx }: { widget: Widget; ctx: MarkdownContext }) {
  const { lang, settings: s } = ctx;
  const title = pick(s.title_tr, s.title_en, lang);
  const location = pick(s.location_tr, s.location_en, lang);

  switch (widget) {
    case "profile-header":
      return (
        <>
          <div className="profile-header">
            {s.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.avatar_url} alt={s.name} className="profile-avatar" />
            )}
            <div>
              <h1 className="profile-name">
                {T.hi[lang]} {s.name}
              </h1>
              <p className="profile-meta">
                {title && <strong>{title}</strong>}
                {location && (
                  <>
                    {lang === "en" ? ` based in ${location}.` : ` · ${location}`}
                  </>
                )}
                <br />
                <em className="profile-subtitle">{pick(s.subtitle_tr, s.subtitle_en, lang)}</em>
              </p>
            </div>
          </div>
          <div className="profile-links">
            {s.github_url && (
              <a href={s.github_url} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden /> GitHub
              </a>
            )}
            {s.linkedin_url && (
              <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer">
                <FaLinkedin aria-hidden /> LinkedIn
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`}>
                <VscMail aria-hidden /> {T.email[lang]}
              </a>
            )}
          </div>
        </>
      );
    case "current-focus":
      return (
        <ul>
          {pick(s.current_focus_tr, s.current_focus_en, lang).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      );
    case "tech-stack":
      return (
        <ul>
          {ctx.skillCategories.map((c) => (
            <li key={c.id}>
              <strong>{pick(c.label_tr, c.label_en, lang)}:</strong> {c.skills.map((sk) => sk.name).join(", ")}
            </li>
          ))}
        </ul>
      );
    case "contact-details":
      return (
        <ul>
          {s.email && (
            <li>
              <strong>{T.email[lang]}:</strong> <a href={`mailto:${s.email}`}>{s.email}</a>
            </li>
          )}
          {location && (
            <li>
              <strong>{T.location[lang]}:</strong> {location}
            </li>
          )}
        </ul>
      );
    case "social-links":
      return (
        <div className="social-links">
          {s.linkedin_url && (
            <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={20} aria-hidden /> {T.linkedin[lang]} <VscLinkExternal size={11} aria-hidden />
            </a>
          )}
          {s.github_url && (
            <a href={s.github_url} target="_blank" rel="noopener noreferrer">
              <FaGithub size={20} aria-hidden /> {T.github[lang]} <VscLinkExternal size={11} aria-hidden />
            </a>
          )}
          {s.medium_url && (
            <a href={s.medium_url} target="_blank" rel="noopener noreferrer">
              <FaMedium size={20} aria-hidden /> {T.medium[lang]} <VscLinkExternal size={11} aria-hidden />
            </a>
          )}
        </div>
      );
  }
}

/** Splits content into markdown chunks and {{widget}} lines. */
export function splitWidgets(source: string): ({ type: "md"; text: string } | { type: "widget"; widget: Widget })[] {
  const parts: ({ type: "md"; text: string } | { type: "widget"; widget: Widget })[] = [];
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.join("").trim()) parts.push({ type: "md", text: buffer.join("\n") });
    buffer = [];
  };
  for (const line of source.split("\n")) {
    const m = WIDGET_LINE.exec(line.trim());
    if (m && (WIDGETS as readonly string[]).includes(m[1])) {
      flush();
      parts.push({ type: "widget", widget: m[1] as Widget });
    } else {
      buffer.push(line);
    }
  }
  flush();
  return parts;
}

export default function Markdown({ source, ctx }: { source: string; ctx: MarkdownContext }) {
  return (
    <div className="markdown-body">
      {splitWidgets(source).map((part, i) =>
        part.type === "md" ? <MarkdownBlock key={i} source={part.text} /> : <WidgetView key={i} widget={part.widget} ctx={ctx} />,
      )}
    </div>
  );
}
