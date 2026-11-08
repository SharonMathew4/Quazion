import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://quazion.org"),
  title: {
    default: "QUAZION — Exploring Knowledge Beyond Boundaries",
    template: "%s | QUAZION",
  },
  description:
    "QUAZION is an open scientific knowledge archive and publishing platform for researchers, educators, and science enthusiasts.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "QUAZION — Exploring Knowledge Beyond Boundaries",
    description:
      "Open scientific knowledge archive, research articles, preprints, and peer-reviewed community inquiry.",
    url: "https://quazion.org",
    siteName: "QUAZION",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QUAZION Open Science Archive",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QUAZION — Exploring Knowledge Beyond Boundaries",
    description:
      "Open scientific knowledge archive, research articles, preprints, and peer-reviewed community inquiry.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
