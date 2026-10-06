import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown, { safeUrl, splitWidgets } from "@/components/content/Markdown";
import { withPublishedAncestors } from "@/lib/cms/data";
import { nodeName, pick, type ExplorerNode, type SiteSettings } from "@/lib/cms/types";

const settings = {
  name: "Test Kişi",
  title_tr: "",
  title_en: "Engineer",
  subtitle_tr: "",
  subtitle_en: "Sub",
  location_tr: "Türkiye",
  location_en: "Turkey",
  email: "a@b.co",
  github_url: "https://github.com/x",
  linkedin_url: "",
  medium_url: "",
  website_url: "",
  avatar_url: "/a.png",
  available_for_work: false,
  current_focus_tr: [],
  current_focus_en: ["Focus one"],
  education_degree_tr: "",
  education_degree_en: "",
  education_school: "",
  education_years: "",
  education_gpa: "",
  seo_title: "",
  seo_description_tr: "",
  seo_description_en: "",
  chat_greeting_tr: "",
  chat_greeting_en: "",
  terminal_whoami: "",
} satisfies SiteSettings;

const render = (source: string) => renderToStaticMarkup(<Markdown source={source} ctx={{ lang: "en", settings, skillCategories: [] }} />);

describe("markdown rendering is XSS-safe", () => {
  it("drops raw HTML, including script tags and event handlers", () => {
    const html = render('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n<iframe src="https://evil"></iframe>');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<iframe");
  });

  it("neutralises dangerous link and image URLs", () => {
    const html = render("[x](javascript:alert(1)) [y](data:text/html;base64,PHNjcmlwdD4=) [z](vbscript:msgbox) ![i](javascript:alert(2))");
    expect(html).not.toMatch(/javascript:|data:text|vbscript:/i);
  });

  it("opens external links safely and keeps internal links internal", () => {
    const html = render("[ext](https://example.com) [int](/projects/x)");
    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('href="/projects/x"');
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeUrl("//evil.com/x")).toBe("");
    expect(safeUrl("/ok")).toBe("/ok");
    expect(safeUrl("mailto:a@b.co")).toBe("mailto:a@b.co");
  });

  it("renders GFM tables and code", () => {
    const html = render("| a | b |\n|---|---|\n| 1 | 2 |\n\n```\nnpx serve .\n```");
    expect(html).toContain("<table>");
    expect(html).toContain("npx serve .");
  });
});

describe("widgets", () => {
  it("splits {{widget}} lines and ignores unknown ones", () => {
    const parts = splitWidgets("# A\n{{profile-header}}\ntext\n{{unknown}}\n{{tech-stack}}");
    expect(parts.map((p) => p.type)).toEqual(["md", "widget", "md", "widget"]);
  });

  it("renders the profile header from settings without emoji", () => {
    const html = render("{{profile-header}}\n\n{{current-focus}}");
    expect(html).toContain("Hi, I&#x27;m Test Kişi");
    expect(html).toContain("Engineer");
    expect(html).toContain("Focus one");
    expect(html).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("escapes values coming from settings", () => {
    const html = renderToStaticMarkup(
      <Markdown source="{{profile-header}}" ctx={{ lang: "en", settings: { ...settings, name: "<img src=x onerror=alert(1)>" }, skillCategories: [] }} />,
    );
    expect(html).not.toContain("<img src=x");
  });
});

describe("language fallback", () => {
  it("falls back to the other language when empty", () => {
    expect(pick("tr", "", "en")).toBe("tr");
    expect(pick("", "en", "tr")).toBe("en");
    expect(pick([], ["x"], "tr")).toEqual(["x"]);
    expect(nodeName({ name: "Deneyimle", name_en: "Experience" }, "en")).toBe("Experience");
    expect(nodeName({ name: "README.md", name_en: null }, "en")).toBe("README.md");
  });
});

describe("unpublished folders hide their subtree", () => {
  const node = (id: string, parent: string | null): ExplorerNode => ({
    id,
    parent_id: parent,
    kind: "folder",
    name: id,
    name_en: null,
    file_type: null,
    route: null,
    url: null,
    asset_url: null,
    content_tr: "",
    content_en: "",
    icon: null,
    sort_order: 0,
    is_published: true,
    show_in_explorer: true,
  });

  it("drops nodes whose ancestor is missing (unpublished)", () => {
    // "b" was unpublished, so it was not fetched; "c" lives under it.
    const visible = withPublishedAncestors([node("a", null), node("c", "b"), node("d", "c"), node("e", "a")]);
    expect(visible.map((n) => n.id)).toEqual(["a", "e"]);
  });
});
