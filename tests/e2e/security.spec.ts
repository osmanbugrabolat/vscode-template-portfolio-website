import { expect, test } from "@playwright/test";
import { ADMIN_ROUTES, db, env, login, loginAsAdmin } from "./helpers";

test.describe("security headers", () => {
  test("public pages send a nonce-based CSP and hardening headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=63072000");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("every inline script carries the nonce", async ({ page }) => {
    const res = await page.goto("/");
    const nonce = /'nonce-([^']+)'/.exec(res!.headers()["content-security-policy"])![1];
    const scripts = await page.locator("script").evaluateAll((els) => els.map((e) => (e as HTMLScriptElement).nonce || e.getAttribute("nonce") || ""));
    expect(scripts.length).toBeGreaterThan(0);
    for (const n of scripts) expect(n).toBe(nonce);
  });

  test("admin pages are not cached or indexed", async ({ request }) => {
    const res = await request.get("/admin-login");
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("the API sends restrictive headers", async ({ request }) => {
    const res = await request.post("/api/chat", { data: { message: "merhaba" } });
    expect(res.headers()["content-security-policy"]).toContain("default-src 'none'");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});

test.describe("authentication", () => {
  test("every admin page redirects anonymous visitors to the login", async ({ page }) => {
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await expect(page, route).toHaveURL(/\/admin-login/);
    }
  });

  test("wrong password and unknown email return the same generic error", async ({ page }) => {
    await login(page, env.TEST_ADMIN_EMAIL, "Wrong-Password-123!");
    await expect(page.locator(".adm-alert-error")).toHaveText(/E-posta veya şifre hatalı/);
    await login(page, "nobody@example.test", "Wrong-Password-123!");
    await expect(page.locator(".adm-alert-error")).toHaveText(/E-posta veya şifre hatalı/);
  });

  test("a valid account without admin rights is refused", async ({ page }) => {
    await login(page, env.TEST_OUTSIDER_EMAIL, env.TEST_OUTSIDER_PASSWORD);
    await expect(page.locator(".adm-alert-error")).toHaveText(/E-posta veya şifre hatalı/);
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "admin_session")).toBeUndefined();
  });

  test("repeated failures lock the account temporarily", async ({ page }) => {
    const email = "throttle-target@example.test";
    for (let i = 0; i < 5; i++) {
      await login(page, email, `Wrong-Password-${i}!`);
      await expect(page.locator(".adm-alert-error")).toBeVisible();
    }
    await login(page, email, "Another-Wrong-1!");
    await expect(page.locator(".adm-alert-error")).toHaveText(/Çok fazla başarısız deneme/);
    // Only hashes are stored, never the email or IP in clear text.
    const rows = await db<{ email_hash: string; ip_hash: string }>("select email_hash, ip_hash from public.auth_login_attempts limit 5");
    for (const r of rows) {
      expect(r.email_hash).not.toContain("@");
      expect(r.ip_hash).not.toMatch(/^\d+\.\d+/);
    }
    await db("delete from public.auth_login_attempts");
  });

  test("login sets strict httpOnly cookies and logout clears them", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const session = cookies.find((c) => c.name === "admin_session")!;
    expect(session.httpOnly).toBe(true);
    expect(session.sameSite).toBe("Strict");
    const auth = cookies.filter((c) => c.name.startsWith("sb-"));
    expect(auth.length).toBeGreaterThan(0);
    for (const c of auth) expect(c.httpOnly).toBe(true);
    // Tokens are not readable from page scripts.
    expect(await page.evaluate(() => document.cookie)).not.toMatch(/sb-|admin_session/);

    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page).toHaveURL(/\/admin-login/);
    const after = await page.context().cookies();
    expect(after.find((c) => c.name === "admin_session")).toBeUndefined();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login/);
  });

  test("a forged or tampered session cookie is rejected", async ({ page, context }) => {
    await loginAsAdmin(page);
    const session = (await context.cookies()).find((c) => c.name === "admin_session")!;
    const [body, mac] = session.value.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "00000000-0000-0000-0000-000000000000", iat: Date.now(), lat: Date.now() })).toString("base64url");
    await context.addCookies([{ ...session, value: `${forged}.${mac}` }]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login/);
    void body;
  });

  test("the Supabase session alone is not enough without the admin cookie", async ({ page, context }) => {
    await loginAsAdmin(page);
    await context.clearCookies({ name: "admin_session" });
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/admin-login/);
  });

  test("server actions replayed after logout are refused", async ({ page, context }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");
    const replay: { url: string; headers: Record<string, string>; body: string | null }[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && req.headers()["next-action"]) replay.push({ url: req.url(), headers: req.headers(), body: req.postData() });
    });
    await page.getByRole("button", { name: "Kaydet" }).first().click();
    await expect(page.locator(".adm-toast")).toContainText("kaydedildi");
    expect(replay.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Çıkış yap" }).click();
    await expect(page).toHaveURL(/\/admin-login/);

    const cookieHeader = (await context.cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await page.request.post(replay[0].url, {
      headers: { ...replay[0].headers, cookie: cookieHeader },
      data: replay[0].body ?? "",
      maxRedirects: 0,
    });
    const text = await res.text();
    expect(text).not.toContain("Site ayarları kaydedildi");
    expect(res.status() === 303 || text.includes("Oturumunuz sona erdi") || res.status() >= 400).toBe(true);
  });

  test("cross-site form posts to server actions are rejected", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/settings");
    let action: { url: string; headers: Record<string, string>; body: string | null } | null = null;
    page.on("request", (req) => {
      if (!action && req.method() === "POST" && req.headers()["next-action"]) action = { url: req.url(), headers: req.headers(), body: req.postData() };
    });
    await page.getByRole("button", { name: "Kaydet" }).first().click();
    await expect(page.locator(".adm-toast")).toBeVisible();
    const a = action!;
    const res = await page.request.post(a.url, { headers: { ...a.headers, origin: "https://evil.example" }, data: a.body ?? "" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("cache revalidation webhook", () => {
  test("refuses requests without the secret token", async ({ request }) => {
    expect((await request.post("/api/revalidate")).status()).toBe(401);
    expect((await request.post("/api/revalidate", { headers: { authorization: "Bearer guessed-token" } })).status()).toBe(401);
    expect((await request.get("/api/revalidate")).status()).toBe(405);
  });
});

test.describe("chat API hardening", () => {
  test("rejects wrong content types, oversized and malformed bodies", async ({ request }) => {
    expect((await request.post("/api/chat", { headers: { "content-type": "text/plain" }, data: "hi" })).status()).toBe(415);
    expect((await request.post("/api/chat", { headers: { "content-type": "application/json" }, data: JSON.stringify({ message: "x".repeat(5000) }) })).status()).toBe(413);
    expect((await request.post("/api/chat", { headers: { "content-type": "application/json" }, data: "{not json" })).status()).toBe(400);
    expect((await request.post("/api/chat", { data: { intentId: "../../etc" } })).status()).toBe(400);
    expect((await request.post("/api/chat", { data: { message: "" } })).status()).toBe(400);
    expect((await request.get("/api/chat")).status()).toBe(405);
  });

  test("rate limits a single client", async ({ request }) => {
    await db("delete from public.chat_logs");
    let limited = false;
    for (let i = 0; i < 40 && !limited; i++) {
      const res = await request.post("/api/chat", { data: { message: `soru ${i}` } });
      if (res.status() === 429) limited = true;
      // Logs are written right after the response; give them a moment.
      await new Promise((r) => setTimeout(r, 30));
    }
    expect(limited).toBe(true);
    await db("delete from public.chat_logs");
  });
});
