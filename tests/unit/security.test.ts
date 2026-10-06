import { describe, expect, it } from "vitest";
import {
  ADMIN_SESSION_ABSOLUTE_MS,
  ADMIN_SESSION_IDLE_MS,
  ADMIN_SESSION_TOUCH_MS,
  adminSessionCookieOptions,
  encodeAdminSession,
  verifyAdminSession,
} from "@/lib/security/admin-session";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security/headers";
import { detectMediaType } from "@/lib/media";

const SECRET = "test-secret";
const now = 1_800_000_000_000;

describe("admin session cookie", () => {
  const token = encodeAdminSession(SECRET, { uid: "u1", iat: now, lat: now });

  it("accepts a fresh, correctly signed token", () => {
    const r = verifyAdminSession(SECRET, token, now + 1000);
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.payload.uid).toBe("u1");
  });

  it("rejects a missing or malformed token", () => {
    expect(verifyAdminSession(SECRET, undefined, now)).toEqual({ valid: false, reason: "missing" });
    expect(verifyAdminSession(SECRET, "abc", now)).toEqual({ valid: false, reason: "malformed" });
    expect(verifyAdminSession(SECRET, ".", now)).toEqual({ valid: false, reason: "malformed" });
  });

  it("rejects a token signed with another secret", () => {
    expect(verifyAdminSession("other", token, now)).toEqual({ valid: false, reason: "signature" });
  });

  it("rejects a tampered payload (privilege escalation attempt)", () => {
    const [, mac] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "attacker", iat: now, lat: now })).toString("base64url");
    expect(verifyAdminSession(SECRET, `${forged}.${mac}`, now)).toEqual({ valid: false, reason: "signature" });
  });

  it("enforces the idle timeout", () => {
    expect(verifyAdminSession(SECRET, token, now + ADMIN_SESSION_IDLE_MS + 1)).toEqual({ valid: false, reason: "idle" });
  });

  it("enforces the absolute lifetime even with recent activity", () => {
    const active = encodeAdminSession(SECRET, { uid: "u1", iat: now, lat: now + ADMIN_SESSION_ABSOLUTE_MS });
    expect(verifyAdminSession(SECRET, active, now + ADMIN_SESSION_ABSOLUTE_MS + 1)).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects tokens issued in the future", () => {
    const future = encodeAdminSession(SECRET, { uid: "u1", iat: now + 10 * 60_000, lat: now + 10 * 60_000 });
    expect(verifyAdminSession(SECRET, future, now)).toMatchObject({ valid: false });
  });

  it("asks for a refresh only after the touch interval", () => {
    const early = verifyAdminSession(SECRET, token, now + 1000);
    const late = verifyAdminSession(SECRET, token, now + ADMIN_SESSION_TOUCH_MS + 1);
    expect(early.valid && early.needsTouch).toBe(false);
    expect(late.valid && late.needsTouch).toBe(true);
  });

  it("uses strict, httpOnly cookie options", () => {
    expect(adminSessionCookieOptions(true)).toMatchObject({ httpOnly: true, secure: true, sameSite: "strict", path: "/" });
  });
});

describe("security headers", () => {
  const csp = buildContentSecurityPolicy({ nonce: "abc", isDev: false, supabaseUrl: "https://x.supabase.co" });

  it("only allows scripts with the request nonce", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("blocks framing, plugins and base-tag hijacking", () => {
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).not.toContain("frame-ancestors *");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("lets the browser talk to Supabase storage for uploads", () => {
    expect(csp).toContain("connect-src 'self' https://x.supabase.co");
  });

  it("allows eval only in development", () => {
    expect(buildContentSecurityPolicy({ nonce: "n", isDev: true, supabaseUrl: "" })).toContain("'unsafe-eval'");
  });

  it("sets the hardening headers", () => {
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(SECURITY_HEADERS["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });
});

describe("upload type detection", () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)].slice(0, 16));
  const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

  it("detects allowed formats by magic bytes", () => {
    expect(detectMediaType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(detectMediaType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(detectMediaType(bytes(...ascii("GIF89a")))).toBe("image/gif");
    expect(detectMediaType(bytes(...ascii("%PDF-1.7")))).toBe("application/pdf");
    expect(detectMediaType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("image/webp");
  });

  it("rejects HTML, SVG and scripts disguised as images", () => {
    expect(detectMediaType(bytes(...ascii("<html><script>")))).toBeNull();
    expect(detectMediaType(bytes(...ascii("<svg xmlns=")))).toBeNull();
    expect(detectMediaType(bytes(...ascii("#!/bin/sh")))).toBeNull();
  });
});
