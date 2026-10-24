import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES, collectionPath } from "@/lib/products";
import { absoluteUrl, isIndexable } from "@/lib/site";

/**
 * Canonical, indexable, 200-status public URLs only. Product and collection URLs follow the live catalog.
 * Well under the 50,000-URL / 50 MB limits, so a single sitemap is correct; switch to generateSitemaps()
 * (and a sitemap index) when the catalog or editorial content grows past that.
 * `lastModified` is omitted on purpose: the catalog stores no reliable modification date and a wrong one is worse than none.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable()) return [];
  const products = await getCatalog();
  const collections = CATEGORIES.filter((c) => products.some((p) => p.category === c.slug));
  return [
    { url: absoluteUrl("/") },
    ...collections.map((c) => ({ url: absoluteUrl(collectionPath(c)) })),
    ...products.map((p) => ({ url: absoluteUrl(`/product/${p.slug}`) })),
    { url: absoluteUrl("/about") },
  ];
}
