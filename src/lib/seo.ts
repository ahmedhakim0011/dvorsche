import type { Product } from "./products";
import { absoluteUrl, siteUrl, SITE_NAME } from "./site";
import { inStock } from "./catalog-utils";

const CURRENCY = "USD"; // the storefront prices in USD only (see lib/products.ts money())

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: SITE_NAME,
  url: siteUrl() || undefined,
  logo: absoluteUrl("/brand/logo-600.png"),
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: SITE_NAME,
  url: siteUrl() || undefined,
  publisher: { "@id": absoluteUrl("/#organization") },
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});

/**
 * Product + Offer markup built only from catalog data that is also visible on the page.
 * No image, SKU/GTIN, rating or shipping data is emitted because none exists in the catalog yet.
 * Add `image` once real product photography exists: Google requires one for merchant-listing eligibility.
 */
export function productLd(p: Product, path: string, images: string[] = []) {
  const offer = (price: number, available: boolean, name?: string) => ({
    "@type": "Offer",
    ...(name ? { name } : {}),
    url: absoluteUrl(path),
    price: price.toFixed(2),
    priceCurrency: CURRENCY,
    availability: `https://schema.org/${available ? "InStock" : "OutOfStock"}`,
  });
  const offers = p.variants && p.variants.length > 1
    ? p.variants.map((v) => offer(v.price, v.stock === undefined || v.stock > 0, v.label))
    : offer(p.variants?.[0]?.price ?? p.price, inStock(p));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`${path}#product`),
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: SITE_NAME },
    url: absoluteUrl(path),
    ...(images.length ? { image: images } : {}),
    offers,
  };
}
