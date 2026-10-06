import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { anonClient, serviceClient, signedInClient } from "../setup/local-env";

const CONTENT_TABLES = ["site_settings", "explorer_nodes", "skill_categories", "skills", "experiences", "chat_intents", "chat_patterns"] as const;
const PRIVATE_TABLES = ["admin_allowlist", "admin_users", "admin_audit_log", "auth_login_attempts", "chat_logs"] as const;

let anon: SupabaseClient;
let outsider: SupabaseClient;
let admin: SupabaseClient;
let service: SupabaseClient;
const created: string[] = [];

beforeAll(async () => {
  anon = anonClient();
  service = serviceClient();
  outsider = await signedInClient("outsider");
  admin = await signedInClient("admin");
});

afterAll(async () => {
  if (created.length) await service.from("explorer_nodes").delete().in("id", created);
  await service.from("explorer_nodes").delete().like("name", "rls-test-%");
});

describe("anonymous visitors", () => {
  it("can read published content", async () => {
    const { data, error } = await anon.from("explorer_nodes").select("id, is_published");
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(10);
    expect(data!.every((n) => n.is_published)).toBe(true);
  });

  it("cannot see unpublished nodes", async () => {
    const { data } = await service.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-hidden", is_published: false }).select("id").single();
    created.push(data!.id);
    const visible = await anon.from("explorer_nodes").select("id").eq("id", data!.id);
    expect(visible.data).toEqual([]);
  });

  it.each(PRIVATE_TABLES)("cannot read %s", async (table) => {
    const { data, error } = await anon.from(table).select("*").limit(1);
    // Either a permission error or an empty result: never rows.
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it.each(CONTENT_TABLES)("cannot insert, update or delete in %s", async (table) => {
    const ins = await anon.from(table).insert({ id: table === "site_settings" ? 1 : undefined } as never);
    expect(ins.error).not.toBeNull();
    const upd = await anon.from(table).update({ updated_at: new Date().toISOString() } as never).neq("id", "00000000-0000-0000-0000-000000000000").select();
    expect(upd.error !== null || (upd.data ?? []).length === 0).toBe(true);
    const del = await anon.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").select();
    expect(del.error !== null || (del.data ?? []).length === 0).toBe(true);
  });

  it("cannot call admin RPCs", async () => {
    const save = await anon.rpc("admin_save_intent", { p_intent: { id: "x" }, p_patterns: [] });
    expect(save.error).not.toBeNull();
    const move = await anon.rpc("admin_move", { p_table: "skills", p_id: "00000000-0000-0000-0000-000000000000", p_direction: 1 });
    expect(move.error).not.toBeNull();
  });

  it("is_admin() is false", async () => {
    const { data } = await anon.rpc("is_admin");
    expect(data).toBe(false);
  });
});

describe("signed-in user without admin rights", () => {
  it("is_admin() is false", async () => {
    const { data } = await outsider.rpc("is_admin");
    expect(data).toBe(false);
  });

  it("cannot write content", async () => {
    const ins = await outsider.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-outsider" });
    expect(ins.error).not.toBeNull();
    const upd = await outsider.from("site_settings").update({ name: "hacked" }).eq("id", 1).select();
    expect(upd.error !== null || (upd.data ?? []).length === 0).toBe(true);
    const settings = await service.from("site_settings").select("name").eq("id", 1).single();
    expect(settings.data!.name).not.toBe("hacked");
  });

  it("cannot grant itself admin rights", async () => {
    const allow = await outsider.from("admin_allowlist").insert({ email: "attacker@example.test" });
    expect(allow.error).not.toBeNull();
    const { data: user } = await outsider.auth.getUser();
    const grant = await outsider.from("admin_users").insert({ user_id: user.user!.id, email: user.user!.email });
    expect(grant.error).not.toBeNull();
  });

  it("cannot read the audit log or chat logs", async () => {
    const audit = await outsider.from("admin_audit_log").select("*").limit(1);
    expect(audit.error !== null || (audit.data ?? []).length === 0).toBe(true);
    const logs = await outsider.from("chat_logs").select("*").limit(1);
    expect(logs.error !== null || (logs.data ?? []).length === 0).toBe(true);
  });

  it("cannot call admin RPCs", async () => {
    const save = await outsider.rpc("admin_save_intent", {
      p_intent: { id: "rls-test", category: "x", priority: 1, title_tr: "a", title_en: "a", answer_tr: "a", answer_en: "a" },
      p_patterns: [],
    });
    expect(save.error?.code).toBe("42501");
  });

  it("cannot upload media", async () => {
    const up = await outsider.storage.from("media").upload(`uploads/2026-01/rls-test.png`, new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }));
    expect(up.error).not.toBeNull();
  });
});

describe("admin", () => {
  it("is_admin() is true", async () => {
    const { data } = await admin.rpc("is_admin");
    expect(data).toBe(true);
  });

  it("can create, update and delete nodes", async () => {
    const ins = await admin.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-admin" }).select("id").single();
    expect(ins.error).toBeNull();
    created.push(ins.data!.id);
    const upd = await admin.from("explorer_nodes").update({ name: "rls-test-admin-2" }).eq("id", ins.data!.id).select();
    expect(upd.data).toHaveLength(1);
    const del = await admin.from("explorer_nodes").delete().eq("id", ins.data!.id).select();
    expect(del.data).toHaveLength(1);
  });

  it("can see unpublished nodes", async () => {
    const { data } = await admin.from("explorer_nodes").select("id").eq("is_published", false);
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("still cannot write the audit log or allowlist directly", async () => {
    const audit = await admin.from("admin_audit_log").insert({ action: "x", entity: "y" });
    expect(audit.error).not.toBeNull();
    const allow = await admin.from("admin_allowlist").insert({ email: "friend@example.test" });
    expect(allow.error).not.toBeNull();
  });

  it("cannot delete the settings row", async () => {
    const del = await admin.from("site_settings").delete().eq("id", 1).select();
    expect(del.error !== null || (del.data ?? []).length === 0).toBe(true);
  });
});

describe("database constraints", () => {
  it("rejects reserved and malformed routes", async () => {
    for (const route of ["/admin", "/api/chat", "/admin-login", "/a/../b", "/UPPER", "relative"]) {
      const r = await service.from("explorer_nodes").insert({ kind: "file", file_type: "markdown", name: "rls-test-route", route });
      expect(r.error, route).not.toBeNull();
    }
  });

  it("rejects dangerous link and embed URLs", async () => {
    const link = await service.from("explorer_nodes").insert({ kind: "file", file_type: "link", name: "rls-test-link", url: "javascript:alert(1)" });
    expect(link.error).not.toBeNull();
    const embed = await service.from("explorer_nodes").insert({ kind: "file", file_type: "embed", name: "rls-test-embed", route: "/rls-test-embed", url: "http://insecure.example" });
    expect(embed.error).not.toBeNull();
  });

  it("prevents moving a folder into its own subtree", async () => {
    const parent = await service.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-parent" }).select("id").single();
    const child = await service.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-child", parent_id: parent.data!.id }).select("id").single();
    created.push(parent.data!.id);
    const cycle = await service.from("explorer_nodes").update({ parent_id: child.data!.id }).eq("id", parent.data!.id);
    expect(cycle.error).not.toBeNull();
  });

  it("only allows files under folders", async () => {
    const file = await service.from("explorer_nodes").insert({ kind: "file", file_type: "link", name: "rls-test-f", url: "https://example.com" }).select("id").single();
    created.push(file.data!.id);
    const under = await service.from("explorer_nodes").insert({ kind: "folder", name: "rls-test-under-file", parent_id: file.data!.id });
    expect(under.error).not.toBeNull();
  });
});

describe("sign-up protection", () => {
  it("rejects accounts that are not on the allowlist, even through the admin API", async () => {
    const r = await service.auth.admin.createUser({ email: "intruder@example.test", password: "Intruder-Password-123!", email_confirm: true });
    expect(r.error).not.toBeNull();
  });

  it("public sign-up is disabled", async () => {
    const r = await anonClient().auth.signUp({ email: "intruder2@example.test", password: "Intruder-Password-123!" });
    expect(r.error).not.toBeNull();
  });
});

describe("storage bucket", () => {
  it("rejects disallowed MIME types even for admins", async () => {
    const up = await admin.storage.from("media").upload(`uploads/2026-01/rls-test.html`, new Blob(["<script>alert(1)</script>"], { type: "text/html" }));
    expect(up.error).not.toBeNull();
  });

  it("anonymous users cannot upload or list", async () => {
    const up = await anon.storage.from("media").upload(`uploads/2026-01/anon.png`, new Blob([new Uint8Array([0x89, 0x50])], { type: "image/png" }));
    expect(up.error).not.toBeNull();
    const list = await anon.storage.from("media").list("uploads");
    expect(list.error !== null || (list.data ?? []).length === 0).toBe(true);
  });
});
