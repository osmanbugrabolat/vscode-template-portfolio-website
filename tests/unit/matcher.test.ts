import { describe, expect, it } from "vitest";
import knowledge from "@/lib/chatbot/knowledge.json";
import { match, normalize, prepareIntents, tokenSimilarity } from "@/lib/chatbot/matcher";
import type { Intent } from "@/lib/chatbot/types";

const prepared = prepareIntents(knowledge.intents as Intent[]);
const answer = (q: string) => {
  const r = match(q, prepared);
  return r.type === "answer" ? r.intent.id : r.type;
};

describe("normalisation", () => {
  it("folds Turkish characters and punctuation", () => {
    expect(normalize("ÜNİVERSİTEDE ne okudun?!")).toBe("universitede ne okudun");
    expect(normalize("Şİ ÇĞ Ö I ı")).toBe("si cg o i i");
  });
  it("tolerates suffixes and typos", () => {
    expect(tokenSimilarity("proje", "projelerin")).toBeGreaterThan(0.9);
    expect(tokenSimilarity("universite", "univrsite")).toBeGreaterThan(0.75);
    expect(tokenSimilarity("ver", "veritabani")).toBeLessThan(0.8);
  });
});

describe("intent matching", () => {
  it.each([
    ["merhaba", "greeting"],
    ["hangi okulda okudun", "education"],
    ["üniverstiede ne okudun", "education"],
    ["not ortalaman kaç", "gpa-ranking"],
    ["projelerin", "projects-overview"],
    ["pong", "project-neon-pong"],
    ["cv", "cv"],
    ["deneyimlerin neler", "experience-overview"],
    ["huawei stajı ne zaman", "huawei-internship"],
    ["mail adresin ne", "contact-email"],
    ["iş teklifi yapmak istiyorum", "availability"],
    ["mcp nedir", "article-mcp"],
    ["yapay zeka", "skills-ai-ml"],
    ["what projects have you built", "projects-overview"],
    ["where did you study", "education"],
    ["how can i contact you", "contact-email"],
  ])("%s -> %s", (q, expected) => {
    expect(answer(q)).toBe(expected);
  });

  it("offers choices when a question is ambiguous", () => {
    const r = match("veritabanı", prepared);
    expect(r.type).toBe("clarify");
    if (r.type === "clarify") expect(r.candidates.length).toBeGreaterThan(1);
  });

  it("falls back for unrelated input", () => {
    expect(answer("asdfgh")).toBe("fallback");
    expect(answer("en sevdiğin yemek ne")).toBe("fallback");
    expect(answer("")).toBe("fallback");
  });

  it("does not contain emoji in any answer", () => {
    const all = JSON.stringify(knowledge);
    expect(all).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
