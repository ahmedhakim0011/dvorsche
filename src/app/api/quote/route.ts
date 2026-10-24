import { getCatalog } from "@/lib/catalog";
import { computeTotals } from "@/lib/pricing";
import { findPromo } from "@/lib/promos";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.lines)) return Response.json({ error: "Invalid request" }, { status: 400 });
  const method = body.shipping === "express" ? "express" : "standard";
  const [catalog, promo] = await Promise.all([getCatalog(), findPromo(body.promo)]);
  return Response.json(computeTotals(body.lines, catalog, method, promo));
}
