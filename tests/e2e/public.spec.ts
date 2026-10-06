import { expect, test } from "@playwright/test";
import { EMOJI, PUBLIC_ROUTES, watchErrors } from "./helpers";

test.describe("public site", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} renders without errors, CSP violations or emoji`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator(".vscode-root")).toBeVisible();
      // The GitHub-hosted games may log their own errors inside the iframe; only our frame matters.
      const ours = errors.filter((e) => !/github\.io|camera|getUserMedia|Permissions policy/i.test(e));
      expect(ours, ours.join("\n")).toEqual([]);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(EMOJI);
    });
  }

  test("unknown routes return 404", async ({ page }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();
  });

  test("malformed routes cannot reach the database lookup", async ({ request }) => {
    for (const path of ["/%2e%2e/admin", "/PROJECTS", "/projects/<script>", "/a%00b"]) {
      // "/%2e%2e/admin" is normalised to /admin and must still be guarded (redirect to login).
      const res = await request.get(path, { maxRedirects: 0 });
      expect([303, 400, 404], path).toContain(res.status());
      if (res.status() === 303) expect(res.headers()["location"]).toContain("/admin-login");
    }
  });

  test("explorer shows the content tree and opens files", async ({ page }) => {
    await page.goto("/");
    const tree = page.getByRole("tree", { name: "Explorer" });
    await expect(tree.getByRole("treeitem", { name: "projects" })).toBeVisible();
    await tree.getByRole("button", { name: "projects" }).click();
    await tree.getByRole("button", { name: "pong-with-mediapipe" }).click();
    await tree.getByRole("treeitem", { name: "README.md" }).first().click();
    await expect(page).toHaveURL(/\/projects\/pong-with-mediapipe$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Neon Pong AI");
    await expect(page.getByRole("tab", { name: "README.md" })).toBeVisible();
  });

  test("language switch re-renders content in English and Turkish", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^(Dil|Language)$/ }).first().click();
    await page.getByRole("menuitemradio", { name: /English/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hi, I'm");
    await page.getByRole("button", { name: "Language" }).first().click();
    await page.getByRole("menuitemradio", { name: /Türkçe/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Merhaba, ben");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("BuğrAI answers, offers options and handles chips", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    const input = page.getByRole("textbox", { name: "" }).last();
    await page.locator(".chat-input").fill("hangi okulda okudun");
    await page.locator(".chat-input").press("Enter");
    await expect(page.locator(".chat-ai .chat-bubble").last()).toContainText("Selçuk");
    await page.locator(".chat-input").fill("veritabanı");
    await page.locator(".chat-input").press("Enter");
    await expect(page.locator(".chat-ai").last().locator(".chat-option")).toHaveCount(2);
    await page.locator(".chat-ai").last().locator(".chat-option").first().click();
    await expect(page.locator(".chat-ai .chat-bubble").last()).toContainText("PostgreSQL");
    void input;
  });
});
