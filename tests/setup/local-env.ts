import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { localEnv } from "./env-file";

export { localEnv };

const options = { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as unknown as typeof WebSocket } };

export function anonClient(): SupabaseClient {
  const env = localEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, options);
}

export function serviceClient(): SupabaseClient {
  const env = localEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, options);
}

export async function signedInClient(kind: "admin" | "outsider"): Promise<SupabaseClient> {
  const env = localEnv();
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, options);
  const email = kind === "admin" ? env.TEST_ADMIN_EMAIL : env.TEST_OUTSIDER_EMAIL;
  const password = kind === "admin" ? env.TEST_ADMIN_PASSWORD : env.TEST_OUTSIDER_PASSWORD;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Could not sign in ${kind}: ${error.message}`);
  return client;
}
