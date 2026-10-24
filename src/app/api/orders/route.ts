import { revalidateTag } from "next/cache";
import { getLiveCatalog } from "@/lib/catalog";
import { computeTotals } from "@/lib/pricing";
import { findPromo } from "@/lib/promos";
import { createOrder, OrderError } from "@/lib/orders";

const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  if (!b || !Array.isArray(b.lines)) return Response.json({ error: "Invalid request" }, { status: 400 });

  const email = str(b.email);
  const name = str(b.name);
  const a = b.address ?? {};
  const address = {
    line1: str(a.line1),
    line2: str(a.line2) || undefined,
    city: str(a.city),
    region: str(a.region),
    postal: str(a.postal, 20),
    country: str(a.country, 60),
  };
  const digits = str(b.cardNumber, 30).replace(/\D/g, "");

  const errors: Record<string, string> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a valid email address";
  if (name.length < 2) errors.name = "Enter your full name";
  if (!address.line1) errors.line1 = "Enter your street address";
  if (!address.city) errors.city = "Enter your city";
  if (!address.postal) errors.postal = "Enter your postal code";
  if (!address.country) errors.country = "Enter your country";
  if (digits.length < 12) errors.cardNumber = "Enter a valid card number";
  if (Object.keys(errors).length) return Response.json({ error: "Validation failed", errors }, { status: 422 });

  // Prices are always recomputed on the server against the live catalog — never trusted from the client.
  const method = b.shipping === "express" ? "express" : "standard";
  const promo = await findPromo(b.promo);
  const totals = computeTotals(b.lines, await getLiveCatalog(), method, promo);
  if (!totals.lines.length) return Response.json({ error: "Your bag is empty" }, { status: 400 });

  // Demo payment: no processor is called and the full card number is never stored.
  // Swap this for a Stripe/Adyen PaymentIntent confirmation before going live.
  try {
    const order = await createOrder({ email, name, address, shippingMethod: method, paymentLast4: digits.slice(-4), totals }, promo?.code);
    revalidateTag("catalog", "max"); // stock changed
    return Response.json({ id: order.id }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) {
      revalidateTag("catalog", "max");
      return Response.json({ error: e.message }, { status: 409 });
    }
    console.error("order failed", e);
    return Response.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
  }
}
