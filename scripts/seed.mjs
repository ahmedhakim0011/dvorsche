// Seeds the catalog (products + variants + opening stock) and the WELCOME10 promo from src/lib/products.ts.
// Safe to re-run: products are upserted by slug; existing stock levels are never overwritten.
import { db } from "./_env.mjs";
import { products } from "../src/lib/products.ts";

const STOCK = 25;
let created = 0;

for (const p of products) {
  const { data: prod, error } = await db
    .from("products")
    .upsert(
      { slug: p.slug, name: p.name, category: p.category, tagline: p.tagline, description: p.description, badge: p.badge ?? null, featured: !!p.featured, notes: p.notes ?? [], details: p.details, art: p.art },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw error;

  const variants = p.variants ?? [{ label: "Standard", price: p.price }];
  for (const [position, v] of variants.entries()) {
    const sku = `${p.slug}-${v.label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "").toUpperCase();
    const { data: existing } = await db.from("product_variants").select("id").eq("product_id", prod.id).eq("label", v.label).maybeSingle();
    if (existing) {
      await db.from("product_variants").update({ price: v.price, position }).eq("id", existing.id);
    } else {
      const { data: row, error: e2 } = await db.from("product_variants").insert({ product_id: prod.id, label: v.label, sku, price: v.price, stock: STOCK, position }).select("id").single();
      if (e2) throw e2;
      await db.from("inventory_movements").insert({ variant_id: row.id, delta: STOCK, stock_after: STOCK, reason: "initial stock" });
      created++;
    }
  }
}

await db.from("promo_codes").upsert({ code: "WELCOME10", pct: 0.1, active: true }, { onConflict: "code", ignoreDuplicates: true });
console.log(`Seeded ${products.length} products (${created} new variants with ${STOCK} units each) and the WELCOME10 code.`);
