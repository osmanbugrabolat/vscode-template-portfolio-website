import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import VSCodeLayout from "@/components/layout/VSCodeLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Osman Buğra BOLAT",
  description:
    "Portfolio of Buğra Bolat — Full Stack Developer specializing in Next.js, TypeScript, and modern web technologies.",
  keywords: [
    "portfolio",
    "full stack developer",
    "react",
    "nextjs",
    "typescript",
    "buğra bolat",
  ],
  authors: [{ name: "Buğra Bolat" }],
  openGraph: {
    title: "Buğra Bolat | Full Stack Developer",
    description:
      "Portfolio of Buğra Bolat — Full Stack Developer specializing in Next.js, TypeScript, and modern web technologies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-ui":
            "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
          "--font-mono":
            "var(--font-jetbrains), 'Fira Code', 'Cascadia Code', Consolas, monospace",
        } as React.CSSProperties
      }
    >
      <body>
        <VSCodeLayout>{children}</VSCodeLayout>
      </body>
    </html>
  );
}
