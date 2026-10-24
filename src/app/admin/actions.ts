"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { adminClient, sessionClient } from "@/lib/supabase/clients";
import { hasSupabase } from "@/lib/supabase/config";
import { requireStaff, type Role } from "@/lib/auth";
import { STATUSES } from "@/lib/admin-data";

export type State = { error?: string; ok?: string } | undefined;

const text = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const lines = (f: FormData, k: string) =>
  text(f, k, 4000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
const int = (v: unknown) => Number.parseInt(String(v), 10);
const hex = /^#[0-9a-f]{6}$/i;

function dbError(message: string) {
  if (message.includes("duplicate key") && message.includes("slug")) return "That slug is already used by another product.";
  if (message.includes("duplicate key") && message.includes("sku")) return "That SKU is already used by another variant.";
  if (message.includes("INSUFFICIENT_STOCK")) return "That would take stock below zero.";
  if (message.includes("TERMINAL")) return "Cancelled and refunded orders can no longer be changed.";
  return message;
}

/* ───────────── Auth ───────────── */
export async function signIn(_: State, f: FormData): Promise<State> {
  if (!hasSupabase()) return { error: "Supabase is not configured." };
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: text(f, "email", 200), password: String(f.get("password") ?? "") });
  if (error || !data.user) return { error: "Invalid email or password." };
  const { data: profile } = await adminClient().from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.role === "customer") {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await sessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ───────────── Products ───────────── */
export async function saveProduct(_: State, f: FormData): Promise<State> {
  await requireStaff();
  const db = adminClient();
  const id = text(f, "id", 40);

  const slug = text(f, "slug", 80).toLowerCase();
  const name = text(f, "name", 120);
  const category = text(f, "category", 20);
  if (!name) return { error: "Name is required." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Slug may only contain lowercase letters, numbers and hyphens." };
  if (!["fragrance", "leather", "home"].includes(category)) return { error: "Choose a category." };

  const art = { type: text(f, "art_type", 20), bg: [text(f, "bg0", 7), text(f, "bg1", 7)], c1: text(f, "c1", 7), c2: text(f, "c2", 7) };
  if (!["bottle", "candle", "tote", "clutch", "wallet", "throw", "vase"].includes(art.type) || ![...art.bg, art.c1, art.c2].every((c) => hex.test(c)))
    return { error: "Artwork type or colours are invalid." };

  let variants: { id?: string; label: string; sku: string; price: number; stock: number; low_stock_threshold: number }[];
  try {
    variants = JSON.parse(String(f.get("variants") ?? "[]"));
  } catch {
    return { error: "Variants could not be read." };
  }
  if (!Array.isArray(variants) || variants.length === 0 || variants.length > 12) return { error: "Add between 1 and 12 variants." };
  const labels = new Set<string>();
  for (const v of variants) {
    v.label = String(v.label ?? "").trim().slice(0, 40);
    v.sku = String(v.sku ?? "").trim().slice(0, 40);
    v.price = Number(v.price);
    v.stock = int(v.stock);
    v.low_stock_threshold = int(v.low_stock_threshold);
    if (!v.label) return { error: "Every variant needs a label (use “Standard” for a single-variant product)." };
    if (labels.has(v.label.toLowerCase())) return { error: `Duplicate variant label “${v.label}”.` };
    labels.add(v.label.toLowerCase());
    if (!(v.price >= 0) || !(v.stock >= 0) || !(v.low_stock_threshold >= 0)) return { error: "Price, stock and threshold must be zero or more." };
  }
  if (variants.length === 1 && variants[0].label.toLowerCase() !== "standard") return { error: "A single-variant product must use the label “Standard”." };

  const row = {
    slug,
    name,
    category,
    tagline: text(f, "tagline", 200),
    description: text(f, "description", 3000),
    badge: text(f, "badge", 30) || null,
    featured: f.get("featured") === "on",
    active: f.get("active") === "on",
    notes: lines(f, "notes"),
    details: lines(f, "details"),
    art,
    updated_at: new Date().toISOString(),
  };

  let productId = id;
  if (id) {
    const { error } = await db.from("products").update(row).eq("id", id);
    if (error) return { error: dbError(error.message) };
  } else {
    const { data, error } = await db.from("products").insert(row).select("id").single();
    if (error) return { error: dbError(error.message) };
    productId = data.id;
  }

  // Remove variants that were deleted in the form.
  const keep = variants.filter((v) => v.id).map((v) => v.id as string);
  if (id) {
    const { data: existing } = await db.from("product_variants").select("id").eq("product_id", id);
    const drop = (existing ?? []).map((e) => e.id).filter((x) => !keep.includes(x));
    if (drop.length) await db.from("product_variants").delete().in("id", drop);
  }

  for (const [position, v] of variants.entries()) {
    const base = { label: v.label, sku: v.sku || null, price: v.price, low_stock_threshold: v.low_stock_threshold, position };
    if (v.id) {
      // Stock for existing variants is only changed via Inventory so every change is audited.
      const { error } = await db.from("product_variants").update(base).eq("id", v.id).eq("product_id", productId);
      if (error) return { error: dbError(error.message) };
    } else {
      const { data, error } = await db.from("product_variants").insert({ ...base, product_id: productId, stock: v.stock }).select("id").single();
      if (error) return { error: dbError(error.message) };
      if (v.stock > 0) await db.from("inventory_movements").insert({ variant_id: data.id, delta: v.stock, stock_after: v.stock, reason: "initial stock" });
    }
  }

  updateTag("catalog");
  redirect("/admin/products");
}

export async function setProductActive(f: FormData) {
  await requireStaff();
  const { error } = await adminClient().from("products").update({ active: f.get("active") === "true", updated_at: new Date().toISOString() }).eq("id", text(f, "id", 40));
  if (error) throw new Error(error.message);
  updateTag("catalog");
}

export async function deleteProduct(f: FormData) {
  await requireStaff("super_admin");
  const { error } = await adminClient().from("products").delete().eq("id", text(f, "id", 40));
  if (error) throw new Error(error.message);
  updateTag("catalog");
  redirect("/admin/products");
}

/* ───────────── Inventory ───────────── */
export async function adjustStock(_: State, f: FormData): Promise<State> {
  const staff = await requireStaff();
  const delta = int(f.get("delta"));
  if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 100000) return { error: "Enter a non-zero number (negative to remove stock)." };
  const { error } = await adminClient().rpc("adjust_stock", { p_variant: text(f, "variant", 40), p_delta: delta, p_reason: text(f, "reason", 120), p_actor: staff.id });
  if (error) return { error: dbError(error.message) };
  updateTag("catalog");
  return { ok: "Stock updated" };
}

/* ───────────── Orders ───────────── */
export async function updateOrder(_: State, f: FormData): Promise<State> {
  const staff = await requireStaff();
  const status = text(f, "status", 20);
  if (!STATUSES.includes(status as never)) return { error: "Invalid status." };
  const { error } = await adminClient().rpc("set_order_status", { p_id: text(f, "id", 40), p_status: status, p_actor: staff.id, p_tracking: text(f, "tracking", 80) });
  if (error) return { error: dbError(error.message) };
  if (status === "cancelled" || status === "refunded") updateTag("catalog"); // stock returned
  return { ok: "Order updated" };
}

/* ───────────── Promotions ───────────── */
export async function savePromo(_: State, f: FormData): Promise<State> {
  await requireStaff();
  const code = text(f, "code", 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const pct = Number(f.get("pct")) / 100;
  if (code.length < 3) return { error: "Code must be at least 3 characters (letters, numbers, - or _)." };
  if (!(pct > 0 && pct <= 1)) return { error: "Discount must be between 1 and 100%." };
  const max = text(f, "max_uses", 8);
  const exp = text(f, "expires_at", 20);
  const { error } = await adminClient()
    .from("promo_codes")
    .upsert({ code, pct, active: true, max_uses: max ? int(max) : null, expires_at: exp ? new Date(exp + "T23:59:59Z").toISOString() : null }, { onConflict: "code" });
  if (error) return { error: dbError(error.message) };
  return { ok: `${code} saved` };
}

export async function setPromoActive(f: FormData) {
  await requireStaff();
  await adminClient().from("promo_codes").update({ active: f.get("active") === "true" }).eq("code", text(f, "code", 40));
}

export async function deletePromo(f: FormData) {
  await requireStaff("super_admin");
  await adminClient().from("promo_codes").delete().eq("code", text(f, "code", 40));
}

/* ───────────── Team (super admin only) ───────────── */
export async function setRole(f: FormData) {
  const me = await requireStaff("super_admin");
  const id = text(f, "id", 40);
  const role = text(f, "role", 20) as Role;
  if (id === me.id) throw new Error("You can't change your own role.");
  if (!["customer", "admin", "super_admin"].includes(role)) throw new Error("Invalid role.");
  const { error } = await adminClient().from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createStaff(_: State, f: FormData): Promise<State> {
  await requireStaff("super_admin");
  const email = text(f, "email", 200).toLowerCase();
  const password = String(f.get("password") ?? "");
  const role = text(f, "role", 20);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  if (!["admin", "super_admin"].includes(role)) return { error: "Choose a role." };
  const db = adminClient();
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: text(f, "name", 100) } });
  if (error || !data.user) return { error: error?.message ?? "Could not create user." };
  await db.from("profiles").upsert({ id: data.user.id, email, full_name: text(f, "name", 100) || null, role });
  return { ok: `${email} can now sign in as ${role.replace("_", " ")}.` };
}
