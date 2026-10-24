import "server-only";
import { connection } from "next/server";
import { adminClient } from "./supabase/clients";
import { mapOrder, type Order, type OrderStatus } from "./orders";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
/** Orders in these states count as sales. */
const COUNTS_AS_SALE = new Set<OrderStatus>(["paid", "processing", "shipped", "delivered"]);
const DAY = 86_400_000;

const fail = (e: { message: string } | null) => {
  if (e) throw new Error(e.message);
};

export interface Dashboard {
  days: number;
  revenue: number;
  prevRevenue: number;
  orders: number;
  prevOrders: number;
  aov: number;
  prevAov: number;
  units: number;
  series: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  byCategory: { category: string; revenue: number }[];
  statusCounts: Record<string, number>;
  lowStock: LowStock[];
  inventoryValue: number;
  inventoryUnits: number;
  actionNeeded: number;
  recent: { id: string; name: string; email: string; status: OrderStatus; total: number; created_at: string }[];
}

export interface LowStock {
  variantId: string;
  productId: string;
  product: string;
  label: string;
  stock: number;
  threshold: number;
}

export async function getDashboard(days = 30): Promise<Dashboard> {
  await connection(); // always per-request, never prerendered
  const db = adminClient();
  const now = Date.now();
  const since = new Date(now - days * 2 * DAY).toISOString();
  const cutoff = now - days * DAY;

  const [ordersQ, itemsQ, variantsQ, recentQ, actionQ] = await Promise.all([
    db.from("orders").select("id,status,total,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(20000),
    db
      .from("order_items")
      .select("name,qty,total,product_id,orders!inner(created_at,status),products(category)")
      .gte("orders.created_at", new Date(cutoff).toISOString())
      .limit(50000),
    db.from("product_variants").select("id,label,stock,price,low_stock_threshold,product_id,products(id,name,active)").limit(5000),
    db.from("orders").select("id,name,email,status,total,created_at").order("created_at", { ascending: false }).limit(8),
    db.from("orders").select("id", { count: "exact", head: true }).in("status", ["paid", "processing"]),
  ]);
  [ordersQ, itemsQ, variantsQ, recentQ, actionQ].forEach((q) => fail(q.error));

  const orders = (ordersQ.data ?? []) as any[];
  const cur = orders.filter((o) => +new Date(o.created_at) >= cutoff);
  const prev = orders.filter((o) => +new Date(o.created_at) < cutoff);
  const sales = (list: any[]) => list.filter((o) => COUNTS_AS_SALE.has(o.status));
  const sum = (list: any[]) => list.reduce((s, o) => s + Number(o.total), 0);
  const curSales = sales(cur);
  const prevSales = sales(prev);

  const series: Dashboard["series"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    const day = curSales.filter((o) => o.created_at.slice(0, 10) === d);
    series.push({ date: d, revenue: sum(day), orders: day.length });
  }

  const items = ((itemsQ.data ?? []) as any[]).filter((i) => COUNTS_AS_SALE.has(i.orders?.status));
  const top = new Map<string, { name: string; units: number; revenue: number }>();
  const cat = new Map<string, number>();
  for (const i of items) {
    const t = top.get(i.name) ?? { name: i.name, units: 0, revenue: 0 };
    t.units += i.qty;
    t.revenue += Number(i.total);
    top.set(i.name, t);
    const c = i.products?.category ?? "other";
    cat.set(c, (cat.get(c) ?? 0) + Number(i.total));
  }

  const variants = ((variantsQ.data ?? []) as any[]).filter((v) => v.products);
  const lowStock: LowStock[] = variants
    .filter((v) => v.stock <= v.low_stock_threshold && v.products.active)
    .map((v) => ({ variantId: v.id, productId: v.products.id, product: v.products.name, label: v.label, stock: v.stock, threshold: v.low_stock_threshold }))
    .sort((a, b) => a.stock - b.stock);

  const statusCounts: Record<string, number> = {};
  for (const o of cur) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

  const rev = sum(curSales);
  const prevRev = sum(prevSales);
  return {
    days,
    revenue: rev,
    prevRevenue: prevRev,
    orders: curSales.length,
    prevOrders: prevSales.length,
    aov: curSales.length ? rev / curSales.length : 0,
    prevAov: prevSales.length ? prevRev / prevSales.length : 0,
    units: items.reduce((s, i) => s + i.qty, 0),
    series,
    topProducts: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6),
    byCategory: [...cat.entries()].map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue),
    statusCounts,
    lowStock,
    inventoryValue: variants.reduce((s, v) => s + v.stock * Number(v.price), 0),
    inventoryUnits: variants.reduce((s, v) => s + v.stock, 0),
    actionNeeded: actionQ.count ?? 0,
    recent: (recentQ.data ?? []) as any,
  };
}

export async function listOrders(opts: { status?: string; q?: string; limit?: number } = {}) {
  await connection(); // always per-request, never prerendered
  let q = adminClient().from("orders").select("id,name,email,status,total,created_at,shipping_method").order("created_at", { ascending: false }).limit(opts.limit ?? 200);
  if (opts.status && STATUSES.includes(opts.status as OrderStatus)) q = q.eq("status", opts.status);
  if (opts.q) {
    const t = opts.q.replace(/[%,()]/g, " ").trim();
    if (t) q = q.or(`id.ilike.%${t}%,email.ilike.%${t}%,name.ilike.%${t}%`);
  }
  const { data, error } = await q;
  fail(error);
  return (data ?? []) as { id: string; name: string; email: string; status: OrderStatus; total: number; created_at: string; shipping_method: string }[];
}

export async function getOrderFull(id: string): Promise<Order | undefined> {
  await connection(); // always per-request, never prerendered
  const db = adminClient();
  const { data: o, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  fail(error);
  if (!o) return undefined;
  const { data: items } = await db.from("order_items").select("*").eq("order_id", id).order("name");
  return mapOrder(o, items ?? []);
}

export interface AdminVariant {
  id?: string;
  label: string;
  sku: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
}
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  badge: string | null;
  featured: boolean;
  active: boolean;
  notes: string[];
  details: string[];
  art: { type: string; bg: [string, string]; c1: string; c2: string };
  variants: AdminVariant[];
}

const toAdminProduct = (r: any): AdminProduct => ({
  ...r,
  variants: [...(r.product_variants ?? [])]
    .sort((a: any, b: any) => a.position - b.position)
    .map((v: any) => ({ id: v.id, label: v.label, sku: v.sku ?? "", price: Number(v.price), stock: v.stock, low_stock_threshold: v.low_stock_threshold })),
});

export async function listProductsAdmin(): Promise<AdminProduct[]> {
  await connection(); // always per-request, never prerendered
  const { data, error } = await adminClient().from("products").select("*, product_variants(*)").order("created_at", { ascending: false });
  fail(error);
  return (data ?? []).map(toAdminProduct);
}

export async function getProductAdmin(id: string): Promise<AdminProduct | undefined> {
  await connection(); // always per-request, never prerendered
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const { data, error } = await adminClient().from("products").select("*, product_variants(*)").eq("id", id).maybeSingle();
  fail(error);
  return data ? toAdminProduct(data) : undefined;
}

export async function listInventory() {
  await connection(); // always per-request, never prerendered
  const db = adminClient();
  const [v, m] = await Promise.all([
    db.from("product_variants").select("id,label,sku,stock,price,low_stock_threshold,products(id,name,active,category)").limit(5000),
    db.from("inventory_movements").select("id,delta,stock_after,reason,order_id,created_at,product_variants(label,products(name))").order("created_at", { ascending: false }).limit(40),
  ]);
  fail(v.error);
  fail(m.error);
  const rows = ((v.data ?? []) as any[])
    .filter((r) => r.products)
    .map((r) => ({ id: r.id as string, product: r.products.name as string, productId: r.products.id as string, active: r.products.active as boolean, category: r.products.category as string, label: r.label as string, sku: (r.sku ?? "") as string, stock: r.stock as number, price: Number(r.price), threshold: r.low_stock_threshold as number }))
    .sort((a, b) => a.stock - b.stock || a.product.localeCompare(b.product));
  return { rows, movements: (m.data ?? []) as any[] };
}

export async function listCustomers() {
  await connection(); // always per-request, never prerendered
  const db = adminClient();
  const [o, s] = await Promise.all([
    db.from("orders").select("email,name,total,status,created_at").order("created_at", { ascending: false }).limit(20000),
    db.from("subscribers").select("email,created_at").order("created_at", { ascending: false }).limit(2000),
  ]);
  fail(o.error);
  fail(s.error);
  const map = new Map<string, { email: string; name: string; orders: number; spent: number; last: string }>();
  for (const r of (o.data ?? []) as any[]) {
    const k = r.email.toLowerCase();
    const c = map.get(k) ?? { email: r.email, name: r.name, orders: 0, spent: 0, last: r.created_at };
    c.orders += 1;
    if (COUNTS_AS_SALE.has(r.status)) c.spent += Number(r.total);
    map.set(k, c);
  }
  return { customers: [...map.values()].sort((a, b) => b.spent - a.spent), subscribers: (s.data ?? []) as { email: string; created_at: string }[] };
}

export async function listPromos() {
  await connection(); // always per-request, never prerendered
  const { data, error } = await adminClient().from("promo_codes").select("*").order("created_at", { ascending: false });
  fail(error);
  return (data ?? []) as { code: string; pct: number; active: boolean; max_uses: number | null; uses: number; expires_at: string | null }[];
}

export async function listTeam() {
  await connection(); // always per-request, never prerendered
  const { data, error } = await adminClient().from("profiles").select("id,email,full_name,role,created_at").in("role", ["admin", "super_admin"]).order("created_at");
  fail(error);
  return (data ?? []) as { id: string; email: string; full_name: string | null; role: string; created_at: string }[];
}
