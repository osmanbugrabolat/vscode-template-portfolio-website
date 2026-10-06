import { execFileSync } from "node:child_process";
import pg from "pg";
import { localEnv } from "../setup/env-file";

/** Fresh throttling counters and test users before every run (local database only). */
export default async function globalSetup() {
  execFileSync("node", ["tests/setup/local-users.mjs"], { stdio: "inherit" });
  const env = localEnv();
  const db = new pg.Client({ connectionString: env.TEST_DB_URL });
  await db.connect();
  await db.query("delete from public.auth_login_attempts");
  await db.query("delete from public.chat_logs");
  await db.query("delete from public.explorer_nodes where name like 'e2e-%'");
  await db.query("delete from public.chat_intents where id like 'e2e-%'");
  await db.query("delete from public.skills where name like 'e2e-%'");
  await db.query("delete from public.experiences where company like 'e2e-%'");
  await db.end();
}
