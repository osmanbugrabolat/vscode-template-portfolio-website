/**
 * Content Security Policy. Scripts only run with the per-request nonce
 * ('strict-dynamic' lets Next's own chunks load). Styles allow inline
 * attributes because the UI uses React style props extensively; style
 * injection cannot execute code under this policy.
 */
export function buildContentSecurityPolicy({ nonce, isDev, supabaseUrl }: { nonce: string; isDev: boolean; supabaseUrl: string }) {
  let supabaseOrigin = "";
  try {
    supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  } catch {
    supabaseOrigin = "";
  }

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    // README files reference screenshots hosted on GitHub and other https hosts.
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    // Admin uploads go straight from the browser to Supabase Storage with a signed URL.
    "connect-src": ["'self'", ...(supabaseOrigin ? [supabaseOrigin] : []), ...(isDev ? ["ws:", "wss:", "http://127.0.0.1:*", "http://localhost:*"] : [])],
    // Playable projects and PDFs are shown in iframes.
    "frame-src": ["'self'", "https:", ...(supabaseOrigin ? [supabaseOrigin] : [])],
    "media-src": ["'self'", "https:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  const policy = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Camera/microphone stay delegable to embedded games (they request them via iframe allow=).
  "Permissions-Policy": "geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), browsing-topics=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "X-DNS-Prefetch-Control": "off",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Origin-Agent-Cluster": "?1",
};
