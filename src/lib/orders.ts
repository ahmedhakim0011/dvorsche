import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Totals, ShippingMethod } from "./pricing";
import { hasSupabase } from "./supabase/config";
import { adminClient } from "./supabase/clients";

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  trackingNumber?: string;
  email: string;
  name: string;
  address: { line1: string; line2?: string; city: string; region: string; postal: string; country: string };
  shippingMethod: ShippingMethod;
  paymentLast4: string;
  totals: Totals;
}

export type NewOrder = Omit<Order, "id" | "createdAt" | "status" | "trackingNumber">;

/** Thrown when an order can't be fulfilled as requested (e.g. an item sold out while checking out). */
export class OrderError extends Error {}

const newId = () => "DV-" + randomBytes(6).toString("hex").toUpperCase();

/* ───────────── Supabase ───────────── */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapOrder(o: any, items: any[]): Order {
  return {
    id: o.id,
    createdAt: o.created_at,
    status: o.status,
    trackingNumber: o.tracking_number ?? undefined,
    email: o.email,
    name: o.name,
    address: o.address,
    shippingMethod: o.shipping_method,
    paymentLast4: o.payment_last4 ?? "····",
    totals: {
      lines: items.map((i) => ({ slug: i.product_slug, variant: i.variant_label ?? undefined, qty: i.qty, name: i.name, unit: Number(i.unit_price), total: Number(i.total) })),
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
      promoApplied: o.promo_code ?? undefined,
      freeShippingRemaining: 0,
    },
  };
}

async function createInDb(o: NewOrder, promoCode?: string): Promise<Order> {
  const id = newId();
  // Stable lock order across concurrent orders avoids deadlocks in place_order().
  const items = [...o.totals.lines]
    .sort((a, b) => (a.slug + (a.variant ?? "")).localeCompare(b.slug + (b.variant ?? "")))
    .map((l) => ({ slug: l.slug, variant: l.variant ?? "", qty: l.qty, unit_price: l.unit }));
  const { error } = await adminClient().rpc("place_order", {
    p: {
      id,
      email: o.email,
      name: o.name,
      address: o.address,
      shipping_method: o.shippingMethod,
      payment_last4: o.paymentLast4,
      promo_code: promoCode ?? "",
      subtotal: o.totals.subtotal,
      discount: o.totals.discount,
      shipping: o.totals.shipping,
      tax: o.totals.tax,
      total: o.totals.total,
      items,
    },
  });
  if (error) {
    const m = error.message.match(/INSUFFICIENT_STOCK:(.+)/);
    if (m) throw new OrderError(`Sorry — ${m[1]} just sold out or doesn't have enough stock for your quantity.`);
    if (error.message.includes("UNKNOWN_ITEM")) throw new OrderError("An item in your bag is no longer available.");
    throw new Error(error.message);
  }
  return { ...o, id, createdAt: new Date().toISOString(), status: "paid" };
}

async function readDb(id: string): Promise<Order | undefined> {
  const db = adminClient();
  const { data: o } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) return undefined;
  const { data: items } = await db.from("order_items").select("*").eq("order_id", id).order("name");
  return mapOrder(o, items ?? []);
}

/* ───────────── Local file fallback (no Supabase configured) ───────────── */
const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "orders.json");

async function readFileStore(): Promise<Order[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function createInFile(o: NewOrder): Promise<Order> {
  const order: Order = { ...o, id: newId(), createdAt: new Date().toISOString(), status: "paid" };
  const all = await readFileStore();
  all.push(order);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  return order;
}

/* ───────────── Public API ───────────── */
export const createOrder = (o: NewOrder, promoCode?: string) => (hasSupabase() ? createInDb(o, promoCode) : createInFile(o));
export const getOrder = async (id: string) => (hasSupabase() ? readDb(id) : (await readFileStore()).find((o) => o.id === id));

export async function saveSubscriber(email: string) {
  if (hasSupabase()) {
    const { error } = await adminClient().from("subscribers").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return;
  }
  const f = path.join(DIR, "subscribers.json");
  let list: string[] = [];
  try {
    list = JSON.parse(await fs.readFile(f, "utf8"));
  } catch {}
  if (!list.includes(email)) list.push(email);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(f, JSON.stringify(list, null, 2));
}
