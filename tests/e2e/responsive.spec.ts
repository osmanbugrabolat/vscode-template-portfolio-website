import { expect, test } from "@playwright/test";
import { ADMIN_ROUTES, PUBLIC_ROUTES, loginAsAdmin, noHorizontalOverflow } from "./helpers";

const VIEWPORTS = [
  { name: "phone", width: 360, height: 740 },
  { name: "phone-large", width: 414, height: 896 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1920, height: 1080 },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("public pages fit the screen", async ({ page }) => {
      for (const route of PUBLIC_ROUTES) {
        await page.goto(route);
        await expect(page.locator(".vscode-root")).toBeVisible();
        await noHorizontalOverflow(page);
        await page.screenshot({ path: `test-results/responsive/${vp.name}/site${route.replaceAll("/", "_") || "_home"}.png` });
      }
    });

    test("admin pages fit the screen", async ({ page }) => {
      await page.goto("/admin-login");
      await noHorizontalOverflow(page);
      await page.screenshot({ path: `test-results/responsive/${vp.name}/admin_login.png` });
      await loginAsAdmin(page);
      for (const route of ADMIN_ROUTES) {
        await page.goto(route);
        await expect(page.locator(".adm-page h1")).toBeVisible();
        await noHorizontalOverflow(page);
        await page.screenshot({ path: `test-results/responsive/${vp.name}/admin${route.replaceAll("/", "_")}.png`, fullPage: false });
      }
      // Open an editor too: the explorer form is the densest screen.
      await page.goto("/admin/explorer");
      await page.locator(".adm-tree-select", { hasText: "WhoAmI.md" }).first().click({ trial: false }).catch(() => {});
      await noHorizontalOverflow(page);
    });

    if (vp.width <= 768) {
      test("mobile navigation works", async ({ page }) => {
        await page.goto("/");
        // Bottom activity bar: open the projects folder list.
        await page.locator(".activity-item.mobile-only[aria-label='projects']").click();
        await expect(page.locator(".vscode-sidebar")).toBeVisible();
        await noHorizontalOverflow(page);
        await loginAsAdmin(page);
        await page.getByRole("button", { name: "Menüyü aç" }).click();
        await expect(page.locator(".adm-sidebar")).toBeInViewport();
        await page.getByRole("link", { name: "Yetenekler" }).click();
        await expect(page).toHaveURL(/\/admin\/skills/);
        await expect(page.locator(".adm-sidebar")).not.toBeInViewport();
      });
    }
  });
}
