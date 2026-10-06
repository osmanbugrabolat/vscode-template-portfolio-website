import { expect, test, type Page } from "@playwright/test";
import { db, loginAsAdmin, watchErrors } from "./helpers";

test.describe.configure({ mode: "serial" });

async function toast(page: Page, text: RegExp | string) {
  await expect(page.locator(".adm-toast").last()).toContainText(text);
  // Clear it so the next assertion cannot match a stale toast from a previous step.
  await page.evaluate(() => document.querySelectorAll(".adm-toast").forEach((t) => t.remove()));
}

test.describe("admin content management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("dashboard and every admin page load without errors", async ({ page }) => {
    const errors = watchErrors(page);
    for (const route of ["/admin", "/admin/explorer", "/admin/settings", "/admin/skills", "/admin/experience", "/admin/media", "/admin/chatbot", "/admin/audit", "/admin/account"]) {
      const res = await page.goto(route);
      expect(res?.status(), route).toBe(200);
      await expect(page.locator(".adm-page h1")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("create folder and markdown page, see it on the site, then unpublish and delete", async ({ page }) => {
    await page.goto("/admin/explorer");
    await page.getByRole("button", { name: "Klasör", exact: true }).click();
    await page.getByLabel(/Klasör adı/).fill("e2e-folder");
    await page.getByRole("button", { name: "Klasörü oluştur" }).click();
    await toast(page, "Klasör oluşturuldu");

    // The new folder is selected, so a new file goes inside it.
    await page.getByRole("button", { name: "Dosya", exact: true }).click();
    await page.getByLabel(/Dosya adı/).fill("e2e-page.md");
    await expect(page.getByLabel("Bulunduğu klasör")).toHaveValue(/[0-9a-f-]{36}/);
    await page.getByRole("button", { name: "Öner" }).click();
    await expect(page.locator("#node-route")).toHaveValue("/e2e-folder/e2e-page");
    const payload = [
      "# E2E Heading",
      "",
      "Hello **world**.",
      "",
      "<script>window.__xss = 1</script>",
      "",
      '<img src=x onerror="window.__xss = 2">',
      "",
      "[bad link](javascript:window.__xss=3)",
      "",
      "{{current-focus}}",
    ].join("\n");
    await page.getByRole("textbox", { name: "İçerik (Türkçe)" }).fill(payload);
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await toast(page, "Dosya oluşturuldu");

    const node = (await db<{ id: string; route: string; parent_id: string }>("select id, route, parent_id from public.explorer_nodes where name = 'e2e-page.md'"))[0];
    expect(node.route).toBe("/e2e-folder/e2e-page");
    expect(node.parent_id).not.toBeNull();

    // Public site shows it, safely.
    const site = await page.context().newPage();
    await site.goto("/e2e-folder/e2e-page");
    await expect(site.getByRole("heading", { level: 1 })).toHaveText("E2E Heading");
    await expect(site.locator(".markdown-body strong").first()).toHaveText("world");
    expect(await site.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    expect(await site.locator(".markdown-body script, .markdown-body img[onerror]").count()).toBe(0);
    const badHref = await site.getByText("bad link").getAttribute("href");
    expect(badHref ?? "").not.toContain("javascript");
    await expect(site.getByRole("tree", { name: "Explorer" }).getByRole("button", { name: "e2e-folder" })).toBeVisible();

    // Unpublish the folder: the page disappears with it.
    await page.locator(".adm-tree-select", { hasText: "e2e-folder" }).click();
    await page.getByRole("switch", { name: /Yayında/ }).uncheck();
    await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
    await toast(page, "Değişiklikler kaydedildi");
    const hidden = await site.goto("/e2e-folder/e2e-page");
    expect(hidden?.status()).toBe(404);

    // Delete the folder (cascades to the page).
    await page.getByRole("button", { name: "Sil", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("1 öğe");
    await page.getByRole("dialog").getByRole("button", { name: "Sil", exact: true }).click();
    await toast(page, "Silindi");
    expect(await db("select id from public.explorer_nodes where name in ('e2e-folder', 'e2e-page.md')")).toEqual([]);
    await site.close();
  });

  test("validation errors are shown and keep the typed input", async ({ page }) => {
    await page.goto("/admin/explorer");
    await page.getByRole("button", { name: "Dosya", exact: true }).click();
    await page.getByLabel(/Dosya adı/).fill("e2e-invalid");
    await page.locator("#node-route").fill("/admin/hijack");
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await expect(page.getByText("Bu adres sistem tarafından kullanılıyor.")).toBeVisible();
    await expect(page.getByLabel(/Dosya adı/)).toHaveValue("e2e-invalid");

    await page.locator("#node-route").fill("/e2e-emoji");
    await page.getByRole("textbox", { name: "İçerik (Türkçe)" }).fill("Merhaba 🚀");
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await expect(page.getByText(/Emoji kullanılamaz/).first()).toBeVisible();
    expect(await db("select id from public.explorer_nodes where name = 'e2e-invalid'")).toEqual([]);
  });

  test("duplicate routes are refused with a clear message", async ({ page }) => {
    await page.goto("/admin/explorer");
    await page.getByRole("button", { name: "Dosya", exact: true }).click();
    await page.getByLabel(/Dosya adı/).fill("e2e-dup");
    await page.locator("#node-route").fill("/cv");
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await toast(page, "Bu adres zaten başka bir sayfada kullanılıyor.");
  });

  test("external link and embed files", async ({ page }) => {
    await page.goto("/admin/explorer");
    await page.getByRole("button", { name: "Dosya", exact: true }).click();
    await page.getByLabel(/Dosya adı/).fill("e2e-link");
    await page.getByLabel("Dosya türü").selectOption("link");
    await page.getByLabel("Bağlantı adresi").fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await expect(page.getByText(/https:\/\/ ile başlayan bir adres/).first()).toBeVisible();
    await page.getByLabel("Bağlantı adresi").fill("https://example.com/e2e");
    await page.getByRole("button", { name: "Dosyayı oluştur" }).click();
    await toast(page, "Dosya oluşturuldu");
    await db("delete from public.explorer_nodes where name = 'e2e-link'");
  });

  test("site settings update the public profile", async ({ page }) => {
    await page.goto("/admin/settings");
    const name = page.getByLabel("Ad soyad");
    const original = await name.inputValue();
    await name.fill("E2E Name Test");
    await page.getByRole("button", { name: "Kaydet" }).first().click();
    await toast(page, "Site ayarları kaydedildi");
    const site = await page.context().newPage();
    await site.goto("/");
    await expect(site.getByRole("heading", { level: 1 })).toContainText("E2E Name Test");
    await name.fill(original);
    await page.getByRole("button", { name: "Kaydet" }).first().click();
    await toast(page, "Site ayarları kaydedildi");
    expect((await db<{ name: string }>("select name from public.site_settings where id = 1"))[0].name).toBe(original);
    await site.reload();
    await expect(site.getByRole("heading", { level: 1 })).toContainText(original);
    await site.close();
  });

  test("skills: add, reorder and delete", async ({ page }) => {
    await page.goto("/admin/skills");
    await page.getByRole("button", { name: "Yetenek ekle" }).first().click();
    await page.getByLabel("Ad", { exact: true }).fill("e2e-skill");
    await page.getByRole("button", { name: "Ekle", exact: true }).click();
    await toast(page, "Yetenek eklendi");
    const site = await page.context().newPage();
    await site.goto("/skills");
    await expect(site.getByText('"e2e-skill"')).toBeVisible();
    await site.close();
    const row = page.locator(".adm-list-item", { hasText: "e2e-skill" });
    await row.getByRole("button", { name: "Yukarı taşı" }).click();
    await expect(page.locator(".adm-list-item", { hasText: "e2e-skill" })).toBeVisible();
    await page.locator(".adm-list-item", { hasText: "e2e-skill" }).getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Sil", exact: true }).click();
    await toast(page, "Silindi");
  });

  test("experience: add and remove", async ({ page }) => {
    await page.goto("/admin/experience");
    await page.getByRole("button", { name: "Deneyim ekle" }).click();
    await page.getByLabel("Şirket / kurum").fill("e2e-company");
    await page.getByLabel("Pozisyon").fill("E2E Engineer");
    await page.getByRole("button", { name: "Deneyimi ekle" }).click();
    await toast(page, "Deneyim eklendi");
    const site = await page.context().newPage();
    await site.goto("/experience");
    await expect(site.getByText("E2E Engineer").first()).toBeVisible();
    await site.close();
    await page.locator(".adm-list-item", { hasText: "e2e-company" }).getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Sil", exact: true }).click();
    await toast(page, "Silindi");
  });

  test("chatbot: new intent is answered by the public API, test tool scores it", async ({ page, request }) => {
    await page.goto("/admin/chatbot");
    await page.getByRole("button", { name: "Yeni" }).click();
    await page.getByLabel(/Kimlik/).fill("e2e-intent");
    await page.getByLabel("Kısa soru (seçenek butonunda görünür)").fill("E2E sorusu?");
    await page.getByLabel("Cevap", { exact: true }).fill("E2E cevabı");
    await page.getByLabel(/Soru kalıpları/).fill("zebra kalibi testi\nzebra testi");
    await page.getByRole("tab", { name: "English" }).click();
    await page.getByLabel("Short question (shown on option chips)").fill("E2E question?");
    await page.getByLabel("Answer", { exact: true }).fill("E2E answer");
    await page.getByRole("button", { name: "Konuyu ekle" }).click();
    await toast(page, "Soru-cevap kaydedildi");

    const res = await request.post("/api/chat", { data: { message: "zebra testi", lang: "tr" } });
    const body = await res.json();
    expect(body.type).toBe("answer");
    expect(body.answer).toBe("E2E cevabı");

    await page.getByRole("tab", { name: /Test et/ }).click();
    await page.getByLabel("Test sorusu").fill("zebra kalibi testi");
    await page.getByRole("button", { name: "Test et" }).last().click();
    await expect(page.getByText("Doğrudan cevap", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: /Konular/ }).click();
    await page.getByRole("button", { name: /E2E sorusu/ }).click();
    await page.getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Sil", exact: true }).click();
    await toast(page, "silindi");
    await db("delete from public.chat_logs");
  });

  test("media: real images upload, disguised files are rejected", async ({ page }) => {
    await page.goto("/admin/media");
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const chooser = page.waitForEvent("filechooser");
    await page.getByText("Dosyaları buraya bırakın").click();
    await (await chooser).setFiles({ name: "e2e-pixel.png", mimeType: "image/png", buffer: png });
    await toast(page, "1 dosya yüklendi");
    await expect(page.locator(".adm-media-name", { hasText: "e2e-pixel" })).toBeVisible();

    const fake = page.waitForEvent("filechooser");
    await page.getByText("Dosyaları buraya bırakın").click();
    await (await fake).setFiles({ name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<html><script>alert(1)</script></html>") });
    await expect(page.locator(".adm-alert-error")).toContainText("reddedildi");

    // Clean up the uploaded pixel.
    await page.locator(".adm-media-item", { hasText: "e2e-pixel" }).getByRole("button", { name: "Sil", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Sil", exact: true }).click();
    await toast(page, "Dosya silindi");
  });

  test("password change enforces the policy", async ({ page }) => {
    await page.goto("/admin/account");
    await page.getByLabel("Mevcut şifre").fill("whatever");
    // Too short: the browser blocks it before it reaches the server.
    await page.getByLabel("Yeni şifre", { exact: true }).fill("weak");
    expect(await page.getByLabel("Yeni şifre", { exact: true }).evaluate((el: HTMLInputElement) => el.validity.tooShort)).toBe(true);
    // Long enough but missing character classes: the server policy rejects it.
    await page.getByLabel("Yeni şifre", { exact: true }).fill("onlylowercaseletters");
    await page.getByLabel("Yeni şifre (tekrar)").fill("onlylowercaseletters");
    await page.getByRole("button", { name: "Şifreyi değiştir" }).click();
    await expect(page.getByText("Şifre büyük harf, küçük harf, rakam ve sembol içermeli.")).toBeVisible();
    await page.getByLabel("Yeni şifre", { exact: true }).fill("Strong-Enough-Pass-99");
    await page.getByLabel("Yeni şifre (tekrar)").fill("Strong-Enough-Pass-99");
    await page.getByRole("button", { name: "Şifreyi değiştir" }).click();
    await expect(page.getByText("Mevcut şifre hatalı.").first()).toBeVisible();
  });

  test("every change is recorded in the audit log", async ({ page }) => {
    await page.goto("/admin/audit");
    await expect(page.locator(".adm-table tbody tr").first()).toBeVisible();
    const rows = await db<{ action: string }>("select action from public.admin_audit_log where action in ('login', 'save', 'delete')");
    expect(rows.length).toBeGreaterThan(3);
  });
});
