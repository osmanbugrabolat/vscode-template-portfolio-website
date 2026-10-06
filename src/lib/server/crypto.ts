import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "./env";

/** Keyed hash for values we must compare but never store in clear (IPs, emails). */
export function hmac(purpose: string, value: string): string {
  return createHmac("sha256", serverEnv.appSecret).update(`${purpose}\u0000${value}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
