# D’Vorsche SEO handover

Files in this folder
- `README.md` this report
- `competitor-intelligence.md` research findings (verified vs unverified)
- `keyword-research.csv` 38 rows, no invented metrics (volume, difficulty and CPC are marked "not measured")
- `architecture-and-page-map.md` URLs, titles, descriptions, schema, cannibalization rules
- `international-and-authority.md` market and hreflang strategy, PR plan
- `content-roadmap.md` 90-day content and execution plan

## 1. Completed in the codebase
| Area | What changed | Files |
|---|---|---|
| Indexing safety | Crawling is only allowed when `NEXT_PUBLIC_SITE_URL` is an https production origin (and `NEXT_PUBLIC_ALLOW_INDEXING` is not `false`). Otherwise robots.txt disallows everything, pages carry `noindex`, and the sitemap is empty. | `src/lib/site.ts`, `src/app/robots.ts`, `src/app/layout.tsx` |
| robots.txt | Allows the site; disallows `/admin`, `/api/`, `/checkout`, `/order/`; points to the sitemap. CSS/JS/images are not blocked. | `src/app/robots.ts` |
| XML sitemap | Canonical, indexable URLs only: home, wallets collection, every product, About. Built from the live catalog, absolute https URLs, no `lastmod` (no reliable date exists), no priority/changefreq. Single file is correct under the 50,000-URL limit. | `src/app/sitemap.ts` |
| Canonicals | Per-page canonical on home, collections, products, About, shop. `metadataBase` set from the site URL. | page files |
| Clean collection URLs | New `/collections/{handle}` (wallets, fragrance, accessories) with unique intro, title and description. Legacy `/shop?category=…` 308-redirects. Unknown handles return a real 404. Empty categories do not appear in nav or sitemap. | `src/app/(store)/collections/[handle]/page.tsx`, `src/components/ShopListing.tsx`, `src/lib/products.ts`, `src/proxy.ts` |
| Filter/sort control | `?sort=` and `?q=` views send `X-Robots-Tag: noindex, follow`; sort links are `rel="nofollow"`. `/shop` is noindex while there is one category. | `next.config.ts`, `src/components/ShopListing.tsx`, `src/app/(store)/shop/page.tsx` |
| Metadata | Titles, descriptions, Open Graph, Twitter cards, default 1200x630 social image, logo PNG for Organization schema, icons. Checkout and orders are noindex. | `src/app/layout.tsx`, `public/og/default.png`, `public/brand/logo-600.png` |
| Structured data | Organization + WebSite (home), Product with Offer per variant, BreadcrumbList (products, collections). Built only from visible catalog data. No image, SKU/GTIN, rating, review or shipping fields are emitted because none exist. | `src/lib/seo.ts`, `src/components/JsonLd.tsx` |
| Internal linking | Visible Home > Collection > Product breadcrumbs, nav and footer use clean URLs, related-product links kept. | `Header`, `Footer`, product page |
| Measurement | Optional GA4 loaded only after explicit consent (no banner and no scripts unless `NEXT_PUBLIC_GA_ID` is set). Events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`. Search Console verification via `NEXT_PUBLIC_GSC_VERIFICATION`. | `src/components/Analytics.tsx`, `src/lib/analytics.ts`, `ViewItem`, `PurchaseEvent`, `.env.local.example` |
| Next.js dev warnings | Added `suppressHydrationWarning` on `<body>` (browser extensions), `data-scroll-behavior`, eager logo loading, product-page Suspense. | `src/app/layout.tsx` |

## 2. Validated (what was actually tested)
All checks ran against a production build (`next build --webpack`, `next start`) with a **test** `NEXT_PUBLIC_SITE_URL` (`https://seo-test.example`), by fetching the HTML with `curl`:
- Lint and `next typegen && tsc --noEmit`: clean. Build: succeeded.
- robots.txt and sitemap.xml: correct content and absolute https URLs, 6 URLs in the sitemap.
- Home, collection and product HTML contain the expected `<title>`, description, canonical, Open Graph, Twitter tags and JSON-LD in the server response (not injected by client JS).
- `/shop?category=leather` -> 308 to `/collections/wallets`; `/shop?category=home` -> 308 to `/collections/accessories`; `?sort=` and `?q=` carry `noindex, follow`; `/shop/` -> 308 `/shop`; `/collections/nothing` -> 404; `/checkout` has `noindex`.
- Static transfer sizes from the production build on localhost (gzip): home ~9 KB HTML + ~188 KB JavaScript, product ~9 KB + ~190 KB, collection ~15 KB + ~188 KB.

## 3. Not validated, and why
- **Core Web Vitals (LCP, INP, CLS): not measured.** The preview browser could not run lab measurements (the pane was hidden and the script timed out). No score is claimed. Run PageSpeed Insights / Lighthouse on the deployed site for a baseline. Layout-shift risk is low by construction (images have dimensions, fonts via `next/font`), but that is a design observation, not a measurement.
- **Structured data validation tools (Rich Results Test, Schema Markup Validator)** were not run; they need a public URL. The JSON-LD was checked by reading the output.
- **Mobile usability** was inspected earlier in the design pass (390 px, no horizontal overflow on the routes tested), not re-run for the SEO changes.
- **Consent banner and GA4 events** were type-checked and built but not exercised with a real GA ID.
- **Hosting/deployment:** none is configured in the repo, so redirect and header behavior was verified only on `next start`, not on your host.

## 4. Measured vs estimated vs assumed
- Measured/observed: the SERP result lists and page facts quoted in the competitor report, and the code validation above.
- Estimated/qualitative: attainability judgments in the keyword CSV (based on who ranks, with no difficulty or volume data).
- Assumed: that the placeholder catalog in `src/lib/products.ts` will be replaced with real data. Structured data and metadata read that data.

## 5. Highest-priority opportunities (qualitative)
1. `/collections/wallets` for "luxury leather wallets", "premium wallets for men" (weak, fragmented SERPs).
2. A buying guide and a bifold-vs-slim comparison (SERPs are brand blogs).
3. UK gift queries (a single DTC brand holds most of the page).
4. PR for roundup inclusion ("best luxury wallets", "wallet under $200"): earn, do not rank.
5. Branded search: open brand SERP, but see the Porsche note below.

## 6. Remaining issues and risks
- **Name risk:** "dvorsche wallet" currently surfaces Porsche Design wallets (about EUR 149 in one listing) and the Porsche shop; search engines appear to auto-correct toward Porsche. Get trademark advice before investing in branded SEO.
- **No product photography:** products are drawn SVG placeholders. Without real images there is no Product `image`, no image SEO and no Merchant Center eligibility. Descriptive alt text exists (product name + brand) and should be refined when photography arrives.
- **Placeholder catalog and copy** must be replaced (the demo products' text includes "Placeholder copy" strings). Do not launch with indexing enabled until it is.
- **Streamed 404s for products:** unknown product slugs return a 404 page with a `noindex` tag (Next.js behavior) but HTTP status 200, because the page streams inside Suspense. Collections return a true 404. If strict status codes matter, add a catalog check in `src/proxy.ts`.
- **No hreflang or localization** (single USD storefront), by design. See `international-and-authority.md`.
- **Single sitemap** will need `generateSitemaps()` and a sitemap index when content grows past 50,000 URLs or when locale folders/editorial are added.
- **Admin SEO:** admin is `noindex` and disallowed; access control is real (Supabase auth), robots.txt is not relied on.

## 7. External configuration still required (owner)
1. Set `NEXT_PUBLIC_SITE_URL=https://your-domain` in the production environment (this turns crawling on). Keep `NEXT_PUBLIC_ALLOW_INDEXING=false` on staging.
2. Add the domain to **Google Search Console**. Either use the HTML-tag method by putting Google's token in `NEXT_PUBLIC_GSC_VERIFICATION`, or DNS verification. Then submit `https://your-domain/sitemap.xml` and use URL Inspection on home, `/collections/wallets` and one product. (Nothing has been submitted; no account access was used.)
3. Create a GA4 property and set `NEXT_PUBLIC_GA_ID`. Review the consent wording for your legal requirements.
4. Google Merchant Center (free listings) after real images, SKUs/GTINs, shipping and returns data exist.
5. Bing Webmaster Tools (import from Search Console).
6. Run PageSpeed Insights and the Rich Results Test on the live URL.

## 8. Next 30 / 60 / 90 days
See `content-roadmap.md`. In short: 30 = go-live configuration, real catalog and photography, baseline measurements, first guides drafted and fact-checked; 60 = publish guides and gift guide, begin editor outreach, review Search Console; 90 = double down on what earns impressions, decide on UK storefront and translation investment with data.
