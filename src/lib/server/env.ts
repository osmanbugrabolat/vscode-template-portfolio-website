import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Server-side configuration. Only this module reads process.env. */
export const serverEnv = {
  get supabaseUrl() {
    return required("SUPABASE_URL", process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabasePublishableKey() {
    return required(
      "SUPABASE_PUBLISHABLE_KEY",
      process.env.SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  /**
   * Key material for HMACs (admin session cookie, hashed IPs/emails).
   * A dedicated APP_SECRET is preferred; otherwise it is derived from the
   * Supabase secret key so no extra setup is needed.
   */
  get appSecret() {
    return process.env.APP_SECRET ?? `derived:${this.supabaseSecretKey}`;
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get isConfigured() {
    return Boolean(
      (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        (process.env.SUPABASE_PUBLISHABLE_KEY ??
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
          process.env.SUPABASE_ANON_KEY ??
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    );
  },
};
