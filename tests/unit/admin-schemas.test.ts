import { describe, expect, it } from "vitest";
import cms from "../../supabase/content/cms.json";
import {
  CategorySchema,
  ExperienceSchema,
  IntentSchema,
  NodeSchema,
  PasswordSchema,
  SettingsSchema,
  SkillSchema,
} from "@/lib/admin-schemas";

/**
 * Each payload mirrors what the browser submits: unchecked checkboxes and
 * fields hidden for the selected type are simply absent.
 */
const UUID = "6f1c9a5e-2b7d-5c3a-8e4f-1a2b3c4d5e6f";

describe("explorer node form", () => {
  it("accepts a new folder (no file fields, unchecked toggles)", () => {
    const r = NodeSchema.safeParse({ id: "", kind: "folder", sort_order: "0", name: "projects", name_en: "", parent_id: "", icon: "" });
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    expect(r.data).toMatchObject({ id: null, parent_id: null, file_type: null, route: null, is_published: false, show_in_explorer: false });
  });

  it("accepts a markdown page", () => {
    const r = NodeSchema.safeParse({
      id: UUID,
      kind: "file",
      sort_order: "10",
      name: "README.md",
      name_en: "",
      parent_id: "0a1b2c3d-4e5f-5a6b-9c7d-8e9f0a1b2c3d",
      file_type: "markdown",
      route: "/projects/demo",
      icon: "markdown",
      content_tr: "# Başlık",
      content_en: "",
      is_published: "on",
      show_in_explorer: "on",
    });
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
  });

  it("requires the right fields per file type", () => {
    const base = { id: "", kind: "file", sort_order: "0", name: "x", name_en: "", parent_id: "", icon: "" };
    expect(NodeSchema.safeParse({ ...base, file_type: "markdown" }).success).toBe(false);
    expect(NodeSchema.safeParse({ ...base, file_type: "link", url: "javascript:alert(1)" }).success).toBe(false);
    expect(NodeSchema.safeParse({ ...base, file_type: "link", url: "https://github.com/x" }).success).toBe(true);
    expect(NodeSchema.safeParse({ ...base, file_type: "embed", route: "/g", url: "http://insecure" }).success).toBe(false);
    expect(NodeSchema.safeParse({ ...base, file_type: "embed", route: "/g", url: "https://user.github.io/g/" }).success).toBe(true);
    expect(NodeSchema.safeParse({ ...base, file_type: "image", route: "/img" }).success).toBe(false);
    expect(NodeSchema.safeParse({ ...base, file_type: "image", route: "/img", asset_url: "/certificates/a.png" }).success).toBe(true);
    expect(NodeSchema.safeParse({ ...base, file_type: "pdf", route: "/cv", asset_url: "javascript:x" }).success).toBe(false);
  });

  it("rejects unknown file types, bad icons and self-parenting", () => {
    const base = { kind: "file", sort_order: "0", name: "x", route: "/x" };
    expect(NodeSchema.safeParse({ ...base, file_type: "html" }).success).toBe(false);
    expect(NodeSchema.safeParse({ ...base, file_type: "markdown", icon: "<svg>" }).success).toBe(false);
    expect(NodeSchema.safeParse({ id: UUID, parent_id: UUID, kind: "folder", name: "loop" }).success).toBe(false);
  });
});

describe("settings form", () => {
  const payload = () => {
    const s = cms.settings as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(s)) {
      if (k === "available_for_work") continue; // unchecked in the seed -> absent
      out[k] = Array.isArray(v) ? v.join("\n") : String(v);
    }
    return out;
  };

  it("accepts the seeded settings exactly as the form submits them", () => {
    const r = SettingsSchema.safeParse(payload());
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    expect(r.data?.available_for_work).toBe(false);
  });

  it("rejects insecure profile links and emoji", () => {
    expect(SettingsSchema.safeParse({ ...payload(), github_url: "http://github.com/x" }).success).toBe(false);
    expect(SettingsSchema.safeParse({ ...payload(), linkedin_url: "javascript:alert(1)" }).success).toBe(false);
    expect(SettingsSchema.safeParse({ ...payload(), title_en: "Engineer 🚀" }).success).toBe(false);
    expect(SettingsSchema.safeParse({ ...payload(), email: "not-an-email" }).success).toBe(false);
  });
});

describe("skills forms", () => {
  it("accepts a new category and skill", () => {
    expect(CategorySchema.safeParse({ id: "", key: "ai_ml", label_tr: "YZ", label_en: "AI", type_name: "MLTool[]" }).success).toBe(true);
    expect(SkillSchema.safeParse({ id: "", category_id: UUID, name: "Python", level: "80", icon: "python" }).success).toBe(true);
    expect(SkillSchema.safeParse({ id: "", category_id: UUID, name: "Python", level: "80", icon: "" }).success).toBe(true);
  });

  it("enforces level range and key format", () => {
    expect(SkillSchema.safeParse({ id: "", category_id: UUID, name: "x", level: "101", icon: "" }).success).toBe(false);
    expect(CategorySchema.safeParse({ id: "", key: "Bad Key", label_tr: "a", label_en: "a", type_name: "x" }).success).toBe(false);
  });
});

describe("experience form", () => {
  it("accepts an unpublished entry (checkbox absent)", () => {
    const r = ExperienceSchema.safeParse({
      id: "",
      company: "ACME",
      tech: "Next.js, TypeScript",
      position_tr: "Mühendis",
      duration_tr: "2024 – Günümüz",
      location_tr: "",
      description_tr: "",
      highlights_tr: "a\nb",
      position_en: "",
      duration_en: "",
      location_en: "",
      description_en: "",
      highlights_en: "",
    });
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    expect(r.data).toMatchObject({ is_published: false, tech: ["Next.js", "TypeScript"], highlights_tr: ["a", "b"] });
  });
});

describe("chatbot form", () => {
  const base = {
    original_id: "",
    id: "new-topic",
    category: "about",
    priority: "10",
    title_tr: "Soru?",
    title_en: "Question?",
    answer_tr: "Cevap",
    answer_en: "Answer",
    patterns_tr: "bir\niki",
    patterns_en: "",
    keywords: "",
    links: "",
    follow_ups: "",
  };

  it("accepts a new intent with an inactive toggle", () => {
    const r = IntentSchema.safeParse(base);
    expect(r.success, JSON.stringify(r.error?.issues)).toBe(true);
    expect(r.data).toMatchObject({ is_active: false, original_id: null, patterns_tr: ["bir", "iki"], links: [] });
  });

  it("parses links and rejects unsafe ones", () => {
    const ok = IntentSchema.safeParse({ ...base, links: "CV | CV | /cv\nGitHub | GitHub | https://github.com/x" });
    expect(ok.success).toBe(true);
    expect(IntentSchema.safeParse({ ...base, links: "x | x | javascript:alert(1)" }).success).toBe(false);
    expect(IntentSchema.safeParse({ ...base, links: "x | x | //evil.com" }).success).toBe(false);
  });

  it("validates ids and follow-ups", () => {
    expect(IntentSchema.safeParse({ ...base, id: "Bad Id" }).success).toBe(false);
    expect(IntentSchema.safeParse({ ...base, follow_ups: "a,b,c,d,e,f,g" }).success).toBe(false);
  });
});

describe("password form", () => {
  it("requires matching, strong, different passwords", () => {
    expect(PasswordSchema.safeParse({ current_password: "old", new_password: "Strong-Pass-123!", confirm_password: "Strong-Pass-123!" }).success).toBe(true);
    expect(PasswordSchema.safeParse({ current_password: "old", new_password: "Strong-Pass-123!", confirm_password: "Different-123!" }).success).toBe(false);
    expect(PasswordSchema.safeParse({ current_password: "Strong-Pass-123!", new_password: "Strong-Pass-123!", confirm_password: "Strong-Pass-123!" }).success).toBe(false);
    expect(PasswordSchema.safeParse({ current_password: "", new_password: "Strong-Pass-123!", confirm_password: "Strong-Pass-123!" }).success).toBe(false);
  });
});
