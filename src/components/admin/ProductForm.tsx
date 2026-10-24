"use client";

import { useState } from "react";
import ActionForm from "./ActionForm";
import ProductArt from "@/components/ProductArt";
import { saveProduct } from "@/app/admin/actions";
import type { AdminProduct, AdminVariant } from "@/lib/admin-data";
import { CATEGORIES, type Product } from "@/lib/products";

const ART: [string, string][] = [["wallet", "Wallet"], ["clutch", "Clutch"], ["tote", "Tote"], ["bottle", "Fragrance bottle"], ["candle", "Candle"], ["throw", "Throw"], ["vase", "Vase"]];
const blankVariant = (): AdminVariant => ({ label: "Standard", sku: "", price: 0, stock: 0, low_stock_threshold: 5 });

export default function ProductForm({ product }: { product?: AdminProduct }) {
  const [variants, setVariants] = useState<AdminVariant[]>(product?.variants.length ? product.variants : [blankVariant()]);
  const [art, setArt] = useState(product?.art ?? { type: "wallet", bg: ["#f1e8d6", "#d9ccb0"] as [string, string], c1: "#4b1622", c2: "#a98a52" });
  const [name, setName] = useState(product?.name ?? "");
  const set = (i: number, patch: Partial<AdminVariant>) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  return (
    <ActionForm action={saveProduct} submit={product ? "Save changes" : "Create product"} className="a-form pf" btnClass="a-btn a-btn-primary">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="art_type" value={art.type} />

      <div className="pf-main">
        <section className="a-card">
          <h2>Details</h2>
          <label>Name<input name="name" required value={name} onChange={(e) => setName(e.target.value)} /></label>
          <div className="a-two">
            <label>Slug (URL)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={product?.slug ?? ""} placeholder="my-product" /></label>
            <label>Category
              <select name="category" defaultValue={product?.category ?? "leather"}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </label>
          </div>
          <label>Tagline<input name="tagline" defaultValue={product?.tagline ?? ""} /></label>
          <label>Description<textarea name="description" rows={4} defaultValue={product?.description ?? ""} /></label>
          <div className="a-two">
            <label>Notes <small>(one per line)</small><textarea name="notes" rows={4} defaultValue={product?.notes.join("\n") ?? ""} /></label>
            <label>Details <small>(one per line)</small><textarea name="details" rows={4} defaultValue={product?.details.join("\n") ?? ""} /></label>
          </div>
        </section>

        <section className="a-card">
          <h2>Variants, pricing &amp; stock</h2>
          <p className="a-muted">A single-variant product must be labelled “Standard”. {product && "Stock for existing variants is changed in Inventory so every change is logged."}</p>
          <div className="a-table-wrap">
            <table className="a-table vtable">
              <thead><tr><th>Label</th><th>SKU</th><th>Price ($)</th><th>Stock</th><th>Low-stock at</th><th /></tr></thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id ?? `n${i}`}>
                    <td><input aria-label="Label" value={v.label} onChange={(e) => set(i, { label: e.target.value })} /></td>
                    <td><input aria-label="SKU" value={v.sku} onChange={(e) => set(i, { sku: e.target.value })} /></td>
                    <td><input aria-label="Price" type="number" min="0" step="0.01" value={v.price} onChange={(e) => set(i, { price: Number(e.target.value) })} /></td>
                    <td><input aria-label="Stock" type="number" min="0" value={v.stock} disabled={!!v.id} onChange={(e) => set(i, { stock: Number(e.target.value) })} /></td>
                    <td><input aria-label="Low stock threshold" type="number" min="0" value={v.low_stock_threshold} onChange={(e) => set(i, { low_stock_threshold: Number(e.target.value) })} /></td>
                    <td><button type="button" className="a-link" disabled={variants.length === 1} onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="a-btn" onClick={() => setVariants((vs) => [...vs, { ...blankVariant(), label: "" }])}>+ Add variant</button>
        </section>
      </div>

      <div className="pf-side">
        <section className="a-card">
          <h2>Status</h2>
          <label className="a-check"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in the store</label>
          <label className="a-check"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on home page</label>
          <label>Badge<input name="badge" defaultValue={product?.badge ?? ""} placeholder="e.g. New, Limited" /></label>
        </section>
        <section className="a-card">
          <h2>Artwork</h2>
          <div className="pf-art"><ProductArt art={art as Product["art"]} label={name || "Preview"} /></div>
          <label>Illustration
            <select value={art.type} onChange={(e) => setArt({ ...art, type: e.target.value })}>
              {ART.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <div className="a-colors">
            {([["bg0", "Backdrop top", art.bg[0]], ["bg1", "Backdrop base", art.bg[1]], ["c1", "Primary", art.c1], ["c2", "Accent", art.c2]] as const).map(([k, l, val]) => (
              <label key={k}>{l}
                <input type="color" name={k} value={val} onChange={(e) => setArt(k === "bg0" ? { ...art, bg: [e.target.value, art.bg[1]] } : k === "bg1" ? { ...art, bg: [art.bg[0], e.target.value] } : { ...art, [k]: e.target.value })} />
              </label>
            ))}
          </div>
          <p className="a-muted">Procedural illustration used until product photography is added.</p>
        </section>
      </div>
    </ActionForm>
  );
}
