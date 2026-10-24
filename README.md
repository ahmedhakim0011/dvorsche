# D’Vorsche — luxury leather storefront + Supabase backend + admin

Luxury leather wallets, with fragrance and cosmetics to follow. Rebranded around the Woven DV monogram (Oxblood `#3E0F1A`, Ivory `#EFE6D4`, Antique Gold `#A98A52`). Next.js 16 (App Router, Cache Components), TypeScript, Supabase (Postgres, Auth, RLS), hand-written design system.

```bash
npm install
npm run dev          # http://localhost:3000   (admin: /admin)
```

Without Supabase keys the store runs on a built-in demo catalog (orders go to `.data/`). Add keys to switch to the real backend.

## Connect Supabase (≈5 minutes)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL editor →** paste and run `supabase/migrations/001_init.sql` (tables, row-level security, transactional order/stock functions).
3. `cp .env.local.example .env.local` and fill in **Project Settings → API**: URL, anon/publishable key, and the **service-role** key (server-only — never commit or expose it).
4. Load the catalog and create yourself as super admin:
   ```bash
   npm run db:seed
   npm run admin:create -- you@example.com "a-strong-password" "Your Name"
   ```
5. **Authentication → Providers → Email:** turn **off** "Allow new users to sign up" (staff are created from the dashboard).
6. `npm run dev`, then sign in at `/admin/login`.

## What's in the admin (`/admin`)

| Area | What you can do |
| --- | --- |
| **Overview** | Revenue, orders, AOV, units, period-over-period change, daily revenue chart, orders by status, revenue by category, top products, low-stock alerts, inventory value, recent orders |
| **Orders** | Filter by status, search by order/name/email, order detail, move through pending → paid → processing → shipped → delivered, tracking number, cancel/refund (auto-restocks) |
| **Products** | Create/edit, variants & pricing, SKUs, visibility, featured, badge, artwork; hide/publish; delete (super admin) |
| **Inventory** | Stock per variant, low/out-of-stock view, audited manual adjustments, movement log (sales, restocks, adjustments) |
| **Customers** | Lifetime spend and order count per customer, newsletter subscribers |
| **Promotions** | Create codes, % off, usage limit, expiry, pause/activate |
| **Team & roles** | *Super admin only:* add staff, promote/demote, revoke access |

Roles: `customer` (default) · `admin` (day-to-day operations) · `super_admin` (everything, plus team management and deletions).

## How it's secured

- Every admin page and server action calls `requireStaff()` on the server (verified with `auth.getUser()`); `proxy.ts` is only an extra optimistic redirect.
- Prices are always recomputed server-side; the browser can't set a price or discount.
- Orders are placed by the `place_order` SQL function, which locks variant rows and verifies stock in one transaction — concurrent checkouts can't oversell, and a failed item rolls back the whole order.
- Row-level security is enabled on every table. Public keys can only read active products; orders, customers and stock history are admin-only. The service-role key is used only in server code.
- No card data is stored (demo payment keeps only the last 4 digits).

## Before going live

- Replace the demo payment in `src/app/api/orders/route.ts` with Stripe/Adyen (confirm the PaymentIntent before calling `createOrder`).
- Add transactional email (order confirmation / shipping) and replace the procedural SVG art with photography.
- Order pages are reachable by anyone holding the (unguessable) order ID; add customer accounts if you need stricter access.

## Layout

```
supabase/migrations/001_init.sql   schema, RLS, place_order / set_order_status / adjust_stock
scripts/seed.mjs, create-admin.mjs catalog seed + first super admin
src/lib/                           catalog (cached), pricing, orders, promos, auth, admin-data, supabase clients
src/app/(store)/                   storefront
src/app/admin/                     login + dashboard (server actions in actions.ts)
src/proxy.ts                       session refresh + /admin guard
```

## Brand system

- Tokens live at the top of `src/app/globals.css`. Gold is an accent; use `--gold-text` for gold-coloured small text on ivory (contrast).
- Logo artwork is in `public/brand/` (generated from the finalized Woven DV files; do not redraw). Use `<Logo />` / `<WovenMark />` from `src/components/Brand.tsx`. Use the `ivory` tone on oxblood grounds.
- `.deco` is the stepped Art Deco frame. Set `--deco-fill` to the colour behind it.
- Product art in `ProductArt.tsx` is procedural placeholder artwork until campaign photography is supplied.

## Needs brand-owner input (not invented)

- **Catalog:** the demo products (The Bifold, The Slim, The Card Holder) are placeholders. Names, colours, prices, materials, dimensions and care details need real data. Manage in `/admin` once Supabase is connected.
- **Photography:** hero, product and story imagery.
- **Policies and pages that do not exist yet:** contact, FAQ, shipping & returns, privacy, terms, customer accounts, wishlist. The "30-day returns", "gift-wrapped as standard" and "complimentary shipping over $250" lines carried over from the previous site; confirm they are D’Vorsche policy.
- **Brand story copy** on the home and About pages is written from the monogram and positioning only. No founding date, location or maker claims are made.
- **Fragrance and cosmetics:** categories exist in the data model (`fragrance`, `home` shown as “Accessories”), and appear in navigation automatically once they hold products. There is no cosmetics category yet; adding one needs a schema change.
- **Name clearance:** D’Vorsche is one letter from PORSCHE; get trademark advice before launch.

## Local development note

Native Next SWC binaries can be blocked by macOS policy. If `next dev` reports that Turbopack is unsupported, use `npx next dev --webpack` and `npx next build --webpack`. Next’s metadata-file loader also fails when the project path contains an apostrophe (this folder is `d'vorsche_website`); build from a path without one.
# dvorsche
