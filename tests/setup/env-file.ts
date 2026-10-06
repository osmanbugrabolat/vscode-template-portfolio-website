import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Loads .env.test.local (local docker Supabase + throwaway users). Tests run from the project root. */
export function localEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.test.local"), "utf8");
  const env = Object.fromEntries(
    text
      .split("\n")
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  ) as Record<string, string>;
  const host = new URL(env.SUPABASE_URL).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") throw new Error("Tests must only run against the local Supabase stack.");
  return env;
}
