import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  encodeAdminSession,
  verifyAdminSession,
} from "@/lib/security/admin-session";
import { buildContentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security/headers";

const isDev = process.env.NODE_ENV === "development";

function supabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function appSecret() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return process.env.APP_SECRET ?? (secret ? `derived:${secret}` : "");
}

function isAdminArea(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function withSecurityHeaders(response: NextResponse, csp: string, pathname: string) {
  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
  if (!isDev) response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  if (isAdminArea(pathname) || pathname === "/admin-login") {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

function redirectToLogin(request: NextRequest, csp: string, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin-login";
  url.search = reason ? `?reason=${reason}` : "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return withSecurityHeaders(response, csp, "/admin-login");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildContentSecurityPolicy({ nonce, isDev, supabaseUrl: supabaseUrl() });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (isAdminArea(pathname)) {
    const secret = appSecret();
    const check = secret
      ? verifyAdminSession(secret, request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
      : ({ valid: false, reason: "missing" } as const);
    if (!check.valid) return redirectToLogin(request, csp, check.reason === "idle" || check.reason === "expired" ? "expired" : undefined);

    // Refresh the Supabase session (rotates tokens) so server components see a valid one.
    const supabase = createServerClient(
      supabaseUrl(),
      process.env.SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        "",
      {
        cookieOptions: { httpOnly: true, secure: !isDev, sameSite: "lax", path: "/" },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (toSet) => {
            for (const { name, value } of toSet) request.cookies.set(name, value);
            response = NextResponse.next({ request: { headers: requestHeaders } });
            for (const { name, value, options } of toSet) {
              response.cookies.set(name, value, { ...options, httpOnly: true, secure: !isDev, sameSite: "lax", path: "/" });
            }
          },
        },
      },
    );
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || data.user.id !== check.payload.uid) return redirectToLogin(request, csp);

    if (check.needsTouch) {
      response.cookies.set(
        ADMIN_SESSION_COOKIE,
        encodeAdminSession(secret, { ...check.payload, lat: Date.now() }),
        adminSessionCookieOptions(!isDev),
      );
    }
  }

  return withSecurityHeaders(response, csp, pathname);
}

export const config = {
  matcher: [
    {
      source: "/((?!api/|_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
