import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, categoryByHandle, collectionPath } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import ShopListing from "@/components/ShopListing";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export async function generateStaticParams() {
  const products = await getCatalog();
  return CATEGORIES.filter((c) => products.some((p) => p.category === c.slug)).map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = categoryByHandle(handle);
  if (!c) return {};
  return { title: c.metaTitle, description: c.metaDescription, alternates: { canonical: collectionPath(c) }, openGraph: { title: c.metaTitle, description: c.metaDescription, url: collectionPath(c) } };
}

export default async function Collection({ params, searchParams }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const c = categoryByHandle(handle);
  const products = await getCatalog();
  // Unknown handles, and categories with no products, are real 404s rather than thin pages.
  if (!c || !products.some((p) => p.category === c.slug)) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: c.label, path: collectionPath(c) }])} />
      <Suspense fallback={<div className="page" aria-busy="true"><p className="eyebrow">Loading…</p></div>}>
        <ShopListing searchParams={searchParams} category={c} />
      </Suspense>
    </>
  );
}
