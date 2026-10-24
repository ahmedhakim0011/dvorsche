import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CATEGORIES } from "@/lib/products";

/**
 * Keeps the Supabase session cookie fresh and bounces anonymous visitors away from /admin.
 * This is an optimistic check only — every admin page and server action re-verifies the role on the server.
 */
const LEGACY_CATEGORY: Record<string, string> = { leather: "/collections/wallets", fragrance: "/collections/fragrance", home: "/collections/accessories" };

export async function proxy(request: NextRequest) {
  // admin.<domain> is the back-office host: its root and any storefront path go to the admin, and crawlers are kept out entirely.
  const host = (request.headers.get("host") ?? "").toLowerCase();
  if (host.startsWith("admin.")) {
    const { pathname } = request.nextUrl;
    if (pathname === "/robots.txt") return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/")) return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Unknown collection handles get a real 404 status. (Product slugs need the catalog; those stream a 404 page with noindex.)
  const m = request.nextUrl.pathname.match(/^\/collections\/([^/]+)$/);
  if (m) return CATEGORIES.some((c) => c.handle === m[1]) ? NextResponse.next() : NextResponse.rewrite(new URL("/_not-found-404", request.url), { status: 404 });

  // Legacy /shop?category=x URLs -> clean collection URLs (one canonical URL per collection). Other params are kept.
  if (request.nextUrl.pathname === "/shop") {
    const target = LEGACY_CATEGORY[request.nextUrl.searchParams.get("category") ?? ""];
    if (target) {
      const to = new URL(target, request.url);
      request.nextUrl.searchParams.forEach((v, k) => k !== "category" && to.searchParams.set(k, v));
      return NextResponse.redirect(to, 308);
    }
    return NextResponse.next();
  }

  // Everything below is the admin session check; storefront requests must not pay for it.
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (!user && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/((?!_next/|brand/|og/|favicon|icon\\.svg|apple-icon).*)"] };
