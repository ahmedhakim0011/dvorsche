import { cacheLife, cacheTag } from "next/cache";
import { products as seed, type Product } from "./products";
import { hasSupabase } from "./supabase/config";
import { adminClient, publicClient } from "./supabase/clients";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapProduct(row: any): Product {
  const vs = [...(row.product_variants ?? [])].sort((a: any, b: any) => a.position - b.position);
  const single = vs.length <= 1 && (vs[0]?.label ?? "Standard") === "Standard";
  const price = vs.length ? Math.min(...vs.map((v: any) => Number(v.price))) : 0;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    price,
    badge: row.badge ?? undefined,
    featured: row.featured,
    notes: row.notes?.length ? row.notes : undefined,
    details: row.details ?? [],
    art: row.art,
    ...(single
      ? { stock: vs[0]?.stock ?? 0 }
      : { variants: vs.map((v: any) => ({ label: v.label, price: Number(v.price), stock: v.stock })) }),
  };
}

/** Public catalog (active products), cached and invalidated by the `catalog` tag. */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  if (!hasSupabase()) return seed;
  const { data, error } = await publicClient()
    .from("products")
    .select("*, product_variants(*)")
    .eq("active", true)
    .order("created_at")
    .order("name");
  if (error) throw new Error(`Catalog query failed: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

/** Uncached catalog for order pricing — always reflects current prices. */
export async function getLiveCatalog(): Promise<Product[]> {
  if (!hasSupabase()) return seed;
  const { data, error } = await adminClient().from("products").select("*, product_variants(*)").eq("active", true);
  if (error) throw new Error(`Catalog query failed: ${error.message}`);
  return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug);
}

export { inStock } from "./catalog-utils";
