# Information architecture and keyword-to-page map

Status key: **Live** = implemented in code. **Planned** = recommended, not built. Titles use the site template (`· D’Vorsche` appended).

## Rendering and stack (audited)
- Next.js 16.4.2 App Router, React 19, Cache Components + partial prerendering, TypeScript, Supabase (products, orders), no deployment config in the repo (host unknown).
- Product, collection, home and About pages are prerendered or server-rendered. Titles, meta, canonical and JSON-LD are in the HTML response (confirmed by `curl` against a production build).
- Before this work there was no robots.txt, sitemap, canonical, Open Graph, JSON-LD or social image.

## URL architecture
```
/                              Home                                    Live
/collections/wallets           Wallets & card holders                  Live (category: leather)
/collections/fragrance         Appears only when products exist        Live, 404 while empty
/collections/accessories       Appears only when products exist        Live, 404 while empty
/product/{slug}                Product page                            Live
/shop                          All products utility page (noindex)     Live
/about                         The House / monogram / care             Live
/journal                       Editorial hub                           Planned
/journal/{slug}                Guides                                  Planned
/collections/gifts-for-him     Curated gift collection                 Planned (needs >= 6 products)
```
- One canonical URL per collection. Old `/shop?category=…` URLs 308-redirect to the clean URL (done in `src/proxy.ts`).
- Sort and search parameters are `noindex, follow` via `X-Robots-Tag` and the sort links are `rel="nofollow"`.
- Fragrance and cosmetics slot in as new collections and a new product category; no URL restructure is needed. Cosmetics needs a new category value in the database (see README).
- Do not create pages for variants or keyword permutations (e.g. one page per colour). Use the product page and variant offers instead.

## Page map
| Page | Primary keyword | Secondary | Intent | Title | Meta description | H1 | Conversion goal | Schema |
|---|---|---|---|---|---|---|---|---|
| `/` (Live) | D’Vorsche | luxury leather wallets, card holders | Brand / discovery | D’Vorsche — Luxury Leather Wallets & Card Holders | Understated leather wallets and card holders from D’Vorsche, marked by the Woven DV monogram. Complimentary shipping over $250. | Made to be carried, never announced. | Enter collection | Organization, WebSite |
| `/collections/wallets` (Live) | luxury leather wallets | premium wallets for men, luxury card holder | Commercial | Luxury Leather Wallets & Card Holders | Shop D’Vorsche leather wallets and card holders: understated design marked by the Woven DV monogram. Complimentary shipping over $250. | Leather wallets & card holders | Product view, add to bag | BreadcrumbList |
| `/product/{slug}` (Live) | {product name} | style + colour words that are true of the product | Transactional | {Name} | tagline + description (<= 300 chars) | {Name} | Add to bag | Product + Offer(s), BreadcrumbList |
| `/about` (Live) | D’Vorsche Woven DV | brand philosophy | Brand | The House | The thinking behind D’Vorsche and the Woven DV monogram… | We make fewer things, quietly. | Browse collection | none needed |
| `/journal/how-to-choose-a-leather-wallet` (Planned) | how to choose a leather wallet | wallet size, card capacity | Informational | How to Choose a Leather Wallet | (write with verified product facts) | How to choose a leather wallet | Click-through to collection | Article |
| `/journal/bifold-vs-slim-wallet` (Planned) | bifold vs minimalist wallet | slim vs bifold, card holder vs wallet | Comparison | Bifold vs Slim Wallet: Which Suits You? | … | Bifold or slim: how to decide | Product pages | Article |
| `/journal/how-to-care-for-a-leather-wallet` (Planned) | how to care for a leather wallet | leather conditioning | Informational | How to Care for a Leather Wallet | … | Caring for a leather wallet | Care-aware repeat visits | Article |
| `/journal/best-leather-wallet-gifts` (Planned) | men's leather wallets gift | luxury wallet gift for him | Gift | Leather Wallet Gifts for Him | … | Choosing a wallet as a gift | Collection | Article |

Supporting headings, unique content needs, and internal links for each planned page are in `content-roadmap.md`.

## Rules to prevent cannibalization
- One page per intent. `/collections/wallets` owns "luxury leather wallets"; guides must not target the same head term. Guides link to the collection with descriptive anchor text.
- `/shop` stays `noindex` while there is one category (it duplicates `/collections/wallets`). Re-enable and add to the sitemap when there are two or more categories.
- Collection copy must be unique per collection; do not reuse the wallets intro for other categories.
- Card holders: the catalog has no subcategories. Keep card holders inside Wallets until there are enough products to justify `/collections/card-holders` (suggested threshold: 6+ products).
