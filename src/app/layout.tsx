import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/cms/data";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Osman Buğra BOLAT",
  description: "Portfolio of Osman Buğra BOLAT",
  authors: [{ name: "Osman Buğra BOLAT" }],
  openGraph: { type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e1e1e",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-ui": "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
          "--font-mono": "var(--font-jetbrains), 'Fira Code', 'Cascadia Code', Consolas, monospace",
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}
