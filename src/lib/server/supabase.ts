import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import ws from "ws";
import { serverEnv } from "./env";

/**
 * Session cookies are only ever read and written on the server, so they can
 * be httpOnly: page scripts (and any injected script) can never read tokens.
 */
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: serverEnv.isProduction,
    sameSite: "lax",
    path: "/",
  };
}

/**
 * supabase-js always builds a realtime client, which throws on Node runtimes
 * without a native WebSocket (Node < 22). We never use realtime; giving it the
 * `ws` implementation keeps client creation working on any Node version.
 */
const realtime = { transport: ws as unknown as typeof WebSocket };

const noSession = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, realtime };

/** Anonymous client for public, cacheable reads. RLS limits it to published content. */
export function createPublicClient(): SupabaseClient {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabasePublishableKey, noSession);
}

/**
 * Privileged client (bypasses RLS). Used only for server bookkeeping:
 * audit log, login throttling, chat logs. Never for user-driven content writes.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseSecretKey, noSession);
}

/** Client acting as the signed-in user; every query is subject to RLS. */
export async function createSessionClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const options = authCookieOptions();
  return createServerClient(serverEnv.supabaseUrl, serverEnv.supabasePublishableKey, {
    realtime,
    cookieOptions: options,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options: o } of toSet) cookieStore.set(name, value, { ...o, ...options });
        } catch {
          // Called from a Server Component render: cookies are read-only there.
          // The proxy refreshes sessions for admin routes, so this is safe to ignore.
        }
      },
    },
  });
}
