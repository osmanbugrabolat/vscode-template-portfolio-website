import { expect, type Page } from "@playwright/test";
import pg from "pg";
import { localEnv } from "../setup/env-file";

export const env = localEnv();

export const PUBLIC_ROUTES = [
  "/",
  "/projects/pong-with-mediapipe",
  "/projects/pong-with-mediapipe/play",
  "/projects/magic-frame",
  "/projects/kozmik-toz-enstalasyon",
  "/experience",
  "/skills",
  "/contact",
  "/articles",
  "/cv",
  "/certificates/oracle",
  "/certificates/hwend-721526",
  "/projects/1",
];

export const ADMIN_ROUTES = [
  "/admin",
  "/admin/explorer",
  "/admin/settings",
  "/admin/skills",
  "/admin/experience",
  "/admin/media",
  "/admin/chatbot",
  "/admin/audit",
  "/admin/account",
];

export async function login(page: Page, email = env.TEST_ADMIN_EMAIL, password = env.TEST_ADMIN_PASSWORD) {
  await page.goto("/admin-login");
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
}

export async function loginAsAdmin(page: Page) {
  await login(page);
  await expect(page).toHaveURL(/\/admin$/);
}

/** Collects console errors, CSP violations and uncaught exceptions. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

export async function noHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(scrollWidth, `page is ${scrollWidth}px wide in a ${innerWidth}px viewport`).toBeLessThanOrEqual(innerWidth + 1);
}

export async function db<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: env.TEST_DB_URL });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows as T[];
  } finally {
    await client.end();
  }
}

export const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u;
