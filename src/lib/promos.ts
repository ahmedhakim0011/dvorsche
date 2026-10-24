import { hasSupabase } from "./supabase/config";
import { adminClient } from "./supabase/clients";
import type { Promo } from "./pricing";

const DEMO: Record<string, number> = { WELCOME10: 0.1 };

/** Resolves a promo code to a discount, or undefined if unknown / inactive / expired / used up. */
export async function findPromo(raw?: string): Promise<Promo | undefined> {
  const code = raw?.trim().toUpperCase();
  if (!code || code.length > 40) return undefined;
  if (!hasSupabase()) return DEMO[code] ? { code, pct: DEMO[code] } : undefined;
  const { data } = await adminClient().from("promo_codes").select("*").eq("code", code).maybeSingle();
  if (!data || !data.active) return undefined;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return undefined;
  if (data.max_uses != null && data.uses >= data.max_uses) return undefined;
  return { code, pct: Number(data.pct) };
}
