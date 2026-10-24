import { Suspense } from "react";
import type { Metadata } from "next";
import ShopListing from "@/components/ShopListing";

export const metadata: Metadata = {
  title: "The Collection",
  description: "Browse every D’Vorsche piece: leather wallets and card holders marked by the Woven DV monogram.",
  alternates: { canonical: "/shop" },
  // While every product sits in one category, /shop duplicates /collections/wallets. Keep it out of the index (links still followed)
  // and out of the sitemap. Switch to index: true (and re-add it to src/app/sitemap.ts) once there are two or more categories.
  robots: { index: false, follow: true },
};

export default function Shop({ searchParams }: PageProps<"/shop">) {
  return (
    <Suspense fallback={<div className="page"><header className="page-head"><p className="eyebrow">The full collection</p><h1 className="serif">All pieces</h1></header></div>}>
      <ShopListing searchParams={searchParams} />
    </Suspense>
  );
}
