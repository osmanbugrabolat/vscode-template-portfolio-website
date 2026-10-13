import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // CV fonts are read from disk at runtime (src/lib/cv/render.tsx).
  outputFileTracingIncludes: {
    "/cv-pdf/*": ["./src/lib/cv/fonts/*.ttf"],
    "/admin/cv": ["./src/lib/cv/fonts/*.ttf"],
  },
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/media/**" }]
      : [],
  },
  experimental: {
    serverActions: {
      // Uploads go directly to Supabase Storage; actions only carry form fields.
      bodySizeLimit: "1mb",
    },
  },
  async redirects() {
    // The CV used to be a static file; old links now get the generated one.
    return [{ source: "/cv.pdf", destination: "/cv-pdf/tr", permanent: false }];
  },
  async headers() {
    // API routes skip the proxy, so they get their baseline headers here.
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cache-Control", value: "no-store" },
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
