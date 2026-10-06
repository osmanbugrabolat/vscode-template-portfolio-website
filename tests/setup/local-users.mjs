// Creates throwaway users in the LOCAL Supabase stack used by the tests.
// Refuses to run against anything that is not 127.0.0.1/localhost.
// Credentials are random and written to .env.test.local (gitignored).

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import pg from "pg";

const envPath = new URL("../../.env.test.local", import.meta.url);
const lines = readFileSync(envPath, "utf8").split("\n");
const env = Object.fromEntries(lines.filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));

const url = new URL(env.SUPABASE_URL);
if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
  console.error("Refusing to create test users on a non-local Supabase:", url.hostname);
  process.exit(1);
}

const password = () => `T3st!${randomBytes(18).toString("base64url")}`;
const ADMIN_EMAIL = "e2e-admin@example.test";
const OUTSIDER_EMAIL = "e2e-outsider@example.test";
const adminPassword = password();
const outsiderPassword = password();

const db = new pg.Client({ connectionString: env.TEST_DB_URL });
await db.connect();
await db.query("insert into public.admin_allowlist (email) values ($1), ($2) on conflict do nothing", [ADMIN_EMAIL, OUTSIDER_EMAIL]);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }, realtime: { transport: ws } });
for (const email of [ADMIN_EMAIL, OUTSIDER_EMAIL]) {
  const { rows } = await db.query("select id from auth.users where email = $1", [email]);
  if (rows[0]) await supabase.auth.admin.deleteUser(rows[0].id);
}

// Admin: confirmed + allowlisted -> trigger grants admin_users.
const admin = await supabase.auth.admin.createUser({ email: ADMIN_EMAIL, password: adminPassword, email_confirm: true });
if (admin.error) throw admin.error;
// Outsider: a real, confirmed account whose admin row is then revoked -> signed in, but is_admin() is false.
const outsider = await supabase.auth.admin.createUser({ email: OUTSIDER_EMAIL, password: outsiderPassword, email_confirm: true });
if (outsider.error) throw outsider.error;
await db.query("delete from public.admin_users where user_id = $1", [outsider.data.user.id]);

const { rows: admins } = await db.query("select email from public.admin_users order by email");
await db.end();

const keep = lines.filter((l) => !/^TEST_(ADMIN|OUTSIDER)_/.test(l) && l.trim() !== "");
writeFileSync(
  envPath,
  [...keep, `TEST_ADMIN_EMAIL=${ADMIN_EMAIL}`, `TEST_ADMIN_PASSWORD=${adminPassword}`, `TEST_OUTSIDER_EMAIL=${OUTSIDER_EMAIL}`, `TEST_OUTSIDER_PASSWORD=${outsiderPassword}`, ""].join("\n"),
);
console.log("Local test users ready. admin_users:", admins.map((a) => a.email).join(", "));
