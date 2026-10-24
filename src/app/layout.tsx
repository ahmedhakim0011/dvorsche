import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_NAME, isIndexable, siteUrl } from "@/lib/site";
import Analytics from "@/components/Analytics";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl() || "http://localhost:3000"),
  title: { default: "D’Vorsche — Luxury Leather Wallets", template: "%s · D’Vorsche" },
  description: "D’Vorsche designs understated leather wallets and card holders, marked by the Woven DV monogram.",
  applicationName: SITE_NAME,
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
  // Search Console HTML-tag verification: set NEXT_PUBLIC_GSC_VERIFICATION to the token Google gives you.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body> before React hydrates. */}
      <body suppressHydrationWarning>{children}
        <Analytics />
      </body>
    </html>
  );
}
