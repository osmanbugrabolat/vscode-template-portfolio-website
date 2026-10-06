import { describe, expect, it } from "vitest";
import * as z from "zod";
import {
  assetUrl,
  checkbox,
  emptyToNull,
  containsEmoji,
  httpsUrl,
  lineList,
  linkUrl,
  passwordPolicy,
  routeSchema,
  singleLine,
  tagList,
  text,
} from "@/lib/validation";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => schema.safeParse(v).success;

describe("emoji policy", () => {
  it("detects emoji", () => {
    expect(containsEmoji("Merhaba 👋")).toBe(true);
    expect(containsEmoji("Turkey 🇹🇷")).toBe(true);
    expect(containsEmoji("Rocket 🚀 launch")).toBe(true);
  });
  it("allows normal punctuation and symbols", () => {
    expect(containsEmoji("2024 – Present · Next.js © ® ™ → …")).toBe(false);
    expect(containsEmoji("Selçuk Üniversitesi, GPA 3.75")).toBe(false);
  });
  it("rejects emoji in text fields", () => {
    expect(ok(text(100), "Hi 👋")).toBe(false);
    expect(ok(singleLine(100), "Title")).toBe(true);
  });
});

describe("text fields", () => {
  it("enforces length and single-line", () => {
    expect(ok(singleLine(5), "123456")).toBe(false);
    expect(ok(singleLine(50), "a\nb")).toBe(false);
    expect(ok(singleLine(50, 1), "   ")).toBe(false);
    expect(singleLine(50, 1).parse("  name  ")).toBe("name");
    expect(ok(text(50, 1), " \n ")).toBe(false);
  });
  it("rejects control characters", () => {
    expect(ok(text(100), "a\u0000b")).toBe(false);
    expect(ok(text(100), "line1\nline2\ttab")).toBe(true);
  });
  it("normalises Windows newlines", () => {
    expect(text(100).parse("a\r\nb")).toBe("a\nb");
  });
});

describe("routes", () => {
  it("accepts clean slugs", () => {
    for (const r of ["/", "/cv", "/projects/oyun", "/projects/neon-pong/play", "/a1/b2-c3"]) expect(ok(routeSchema, r)).toBe(true);
  });
  it("rejects traversal, uppercase, encoded and odd paths", () => {
    for (const r of ["", "cv", "/CV", "/a/../b", "/a//b", "/a/", "/a b", "/%2e%2e", "/a?x=1", "/-a", "/a-", "//evil.com"]) expect(ok(routeSchema, r)).toBe(false);
  });
  it("rejects reserved system paths", () => {
    for (const r of ["/admin", "/admin/x", "/admin-login", "/api", "/api/chat", "/auth"]) expect(ok(routeSchema, r)).toBe(false);
    expect(ok(routeSchema, "/administrator")).toBe(true);
  });
});

describe("urls", () => {
  it("accepts https only for embeds", () => {
    expect(ok(httpsUrl, "https://user.github.io/game/")).toBe(true);
    for (const u of ["http://x.com", "javascript:alert(1)", "data:text/html,<script>", "https://user:pass@x.com", "//x.com", "ftp://x"]) expect(ok(httpsUrl, u)).toBe(false);
  });
  it("allows https or mailto for links", () => {
    expect(ok(linkUrl, "mailto:a@b.co")).toBe(true);
    expect(ok(linkUrl, "https://github.com/x")).toBe(true);
    for (const u of ["javascript:alert(1)", "mailto:", "mailto:a@b.co?bcc=x@y.z\nInjected: 1", "vbscript:x"]) expect(ok(linkUrl, u)).toBe(false);
  });
  it("only allows safe asset paths", () => {
    expect(ok(assetUrl, "/cv.pdf")).toBe(true);
    expect(ok(assetUrl, "/certificates/a_b-1.png")).toBe(true);
    expect(ok(assetUrl, "https://x.supabase.co/storage/v1/object/public/media/a.png")).toBe(true);
    for (const u of ["/../etc/passwd", "//evil.com/x.png", "javascript:alert(1)", "/a b.png", "file:///etc/passwd"]) expect(ok(assetUrl, u)).toBe(false);
  });
});

describe("lists", () => {
  it("splits lines and tags", () => {
    expect(lineList(5, 20).parse("a\n\n b \n")).toEqual(["a", "b"]);
    expect(tagList(5, 20).parse("Next.js, TypeScript ,, ")).toEqual(["Next.js", "TypeScript"]);
  });
  it("enforces limits", () => {
    expect(ok(lineList(2, 20), "a\nb\nc")).toBe(false);
    expect(ok(tagList(5, 3), "abcd")).toBe(false);
  });
});

describe("checkbox", () => {
  it("treats a missing key as false (unchecked boxes are not submitted)", () => {
    const schema = z.object({ on: checkbox });
    expect(schema.parse({})).toEqual({ on: false });
    expect(schema.parse({ on: "on" })).toEqual({ on: true });
    expect(schema.safeParse({ on: "yes" }).success).toBe(false);
  });
});

describe("password policy", () => {
  it("requires length and character classes", () => {
    for (const p of ["short1!A", "alllowercase1234!", "ALLUPPERCASE1234!", "NoDigitsHere!!!!", "NoSymbols123456a"]) expect(ok(passwordPolicy, p)).toBe(false);
    expect(ok(passwordPolicy, "Correct-Horse-Battery-9")).toBe(true);
  });
});

describe("optional nullable fields", () => {
  it("treats missing and blank values as null", () => {
    const schema = z.object({ route: z.preprocess(emptyToNull, z.string().nullable()) });
    expect(schema.parse({})).toEqual({ route: null });
    expect(schema.parse({ route: "  " })).toEqual({ route: null });
    expect(schema.parse({ route: "/x" })).toEqual({ route: "/x" });
  });
});
