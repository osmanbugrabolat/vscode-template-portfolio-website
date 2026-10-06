import "server-only";
import { headers } from "next/headers";
import { hmac } from "./crypto";

/**
 * Best-effort client IP. Vercel sets `x-real-ip` itself, so it is preferred
 * over `x-forwarded-for`, whose left-most entry a client could try to forge.
 */
export function clientIpFrom(h: Headers): string {
  const real = h.get("x-real-ip")?.trim();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return real || forwarded || "unknown";
}

export async function clientIpHash(): Promise<string> {
  return hmac("ip", clientIpFrom(await headers()));
}
