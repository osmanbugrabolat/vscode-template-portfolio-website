import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session envelope, layered on top of the Supabase session.
 * Supabase refresh tokens can live for weeks; this cookie adds an absolute
 * lifetime and an idle timeout that the admin area enforces on every request.
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256).
 */
export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000;
export const ADMIN_SESSION_IDLE_MS = 60 * 60 * 1000;
/** Only re-issue the cookie this often, to avoid a Set-Cookie on every request. */
export const ADMIN_SESSION_TOUCH_MS = 5 * 60 * 1000;

export interface AdminSessionPayload {
  /** Supabase auth user id */
  uid: string;
  /** issued at (ms) */
  iat: number;
  /** last activity (ms) */
  lat: number;
}

function sign(secret: string, body: string): string {
  return createHmac("sha256", `admin-session\u0000${secret}`).update(body).digest("base64url");
}

export function encodeAdminSession(secret: string, payload: AdminSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(secret, body)}`;
}

export type AdminSessionCheck =
  | { valid: true; payload: AdminSessionPayload; needsTouch: boolean }
  | { valid: false; reason: "missing" | "malformed" | "signature" | "expired" | "idle" };

export function verifyAdminSession(secret: string, token: string | undefined, now = Date.now()): AdminSessionCheck {
  if (!token) return { valid: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { valid: false, reason: "malformed" };
  const [body, mac] = parts;

  const expected = Buffer.from(sign(secret, body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { valid: false, reason: "signature" };
  }

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed" };
  }
  if (
    typeof payload?.uid !== "string" ||
    !Number.isFinite(payload.iat) ||
    !Number.isFinite(payload.lat) ||
    payload.iat > now + 60_000 ||
    payload.lat < payload.iat
  ) {
    return { valid: false, reason: "malformed" };
  }
  if (now - payload.iat > ADMIN_SESSION_ABSOLUTE_MS) return { valid: false, reason: "expired" };
  if (now - payload.lat > ADMIN_SESSION_IDLE_MS) return { valid: false, reason: "idle" };

  return { valid: true, payload, needsTouch: now - payload.lat > ADMIN_SESSION_TOUCH_MS };
}

export function adminSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "strict" as const,
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_ABSOLUTE_MS / 1000),
  };
}
