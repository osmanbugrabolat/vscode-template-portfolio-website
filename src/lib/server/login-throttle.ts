import "server-only";
import { createServiceClient } from "./supabase";

export const LOGIN_LIMITS = {
  windowMs: 15 * 60 * 1000,
  /** Failed attempts for one email inside the window. */
  perEmail: 5,
  /** Failed attempts from one IP inside the window (covers password spraying). */
  perIp: 20,
};

/** Returns true when either the email or the IP has too many recent failures. */
export async function isLoginThrottled(emailHash: string, ipHash: string): Promise<boolean> {
  const db = createServiceClient();
  const since = new Date(Date.now() - LOGIN_LIMITS.windowMs).toISOString();
  const [byEmail, byIp] = await Promise.all([
    db.from("auth_login_attempts").select("id", { count: "exact", head: true }).eq("email_hash", emailHash).eq("success", false).gte("created_at", since),
    db.from("auth_login_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).eq("success", false).gte("created_at", since),
  ]);
  // Fail closed: if we cannot check, do not allow a login attempt.
  if (byEmail.error || byIp.error) return true;
  return (byEmail.count ?? 0) >= LOGIN_LIMITS.perEmail || (byIp.count ?? 0) >= LOGIN_LIMITS.perIp;
}

export async function recordLoginAttempt(emailHash: string, ipHash: string, success: boolean) {
  const db = createServiceClient();
  const { error } = await db.from("auth_login_attempts").insert({ email_hash: emailHash, ip_hash: ipHash, success });
  if (error) console.error("[auth] failed to record login attempt:", error.message);
  // Keep the table small: attempts older than a day are no longer useful.
  if (Math.random() < 0.05) {
    await db.from("auth_login_attempts").delete().lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }
}
