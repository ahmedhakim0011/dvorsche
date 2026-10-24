import { saveSubscriber } from "@/lib/orders";

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase().slice(0, 200) : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: "Enter a valid email" }, { status: 422 });
  await saveSubscriber(email);
  return Response.json({ ok: true });
}
