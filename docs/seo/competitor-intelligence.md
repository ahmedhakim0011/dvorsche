# Competitor intelligence (researched 2026-10-24)

## How to read this
- **Verified** = seen in a fetched page or raw HTML on 2026-10-24.
- **Unverified** = not visible with the tools used. The fetch tool strips `<head>` and JSON-LD, so meta descriptions, canonicals and structured data were mostly *not checkable*. "Not visible" does not mean "absent".
- No search volumes, difficulty scores, backlink counts, traffic or revenue were obtained. No SEO tool (Semrush, Ahrefs, etc.) was connected. SERP reads came from a US-only search index returning an ordered link list, not a SERP scrape, so SERP features (shopping ads, People Also Ask, image/video packs) could not be observed.
- Blocked or failed: Bottega Veneta, Saint Laurent (tool refused the host); Montblanc, Mulberry, Ridge pages (challenge/403/timeouts); Loewe and others were readable.

## Competitor sets
| Type | Brands | Why they matter |
|---|---|---|
| Aspirational benchmarks | Montblanc, Loewe, Smythson, Mulberry, Bottega Veneta, Saint Laurent | Set the luxury presentation. Own the head terms. Not realistic SEO rivals in year one. |
| Direct product competitors | Secrid, Ekster, Bellroy, Strathberry, SageBrown (UK DTC), Von Baer, Trayvax | Same product and price band, and they rank for the long-tail and informational terms. |
| Competing for the same queries (not brands) | FashionBeans, The Manual, Luxe Digital, Highsnobiety, Gear Patrol, The Gentleman's Journal, Boss Hunting, Harrods, SSENSE, 1stDibs | Editorial roundups, department stores and resale own most "best/luxury wallets" SERPs. |

## What was verified per brand
| Brand | Collection URL pattern | Collection copy | Breadcrumb | Content assets | International | Sitemap |
|---|---|---|---|---|---|---|
| **Bellroy** | `/products/category/wallets` | ~20 words, H1 "Wallets" | Shop > Wallets | `/journal`, care page, no buying or gift guide | Subdomains per language; `sitemap-hreflang.xml`; two subdomains both tagged `zh-TW` (conflict) | `sitemap.xml` + `sitemap-hreflang.xml`; all image alts empty |
| **Secrid** | `/en-us/wallets/all/`, product `/{lang}-{country}/wallets/{model}/` | ~12 words | Only "Homepage" on collection | **2,000-word Wallet Guide** with FAQ; care and repair pages | Subfolders, ~28 locales; 36 hreflang tags on the global page incl. `x-default` | Sitemap **index with 12 children** per locale (pages, stories, collections, wallets, accessories, product-images…) |
| **Smythson** | `/collections/wallets` (Shopify), product `/products/{name}-{sku}` | ~55 words below grid | Full hierarchy to product | Stories blog, gift wrap, no wallet guide | Mostly one root + `/en-eu`, `/en-int`, `/de-de`, `/fr-fr`, `/it-it`; ~200 hreflang tags | Index of 49 children |
| **Loewe** | `/usa/en/men/wallets-and-small-leather-goods/wallets` | ~65 words below the grid (contains a typo) | Present, URL mismatch | None visible | Region-based `/usa/en/`, `/eur/en/` | Index of 4 children |
| **Ekster** | `/collections/wallets` (title "all") | ~22 words + 6-question FAQ | Collection yes, product none | Journal, wallet quiz | Subfolders `/en-gb`, `/en-eu`, `/en-ca`, `/en-int`; many countries mapped to a few buckets | n/a |
| **Strathberry** | `/collections/wallets` | None | None | Care and FAQ pages | Country subdomains + 16 hreflang tags | Listed twice in robots.txt |
| **Montblanc** | `/en-us/…-MB131692.html` (from search) | Not seen | Not seen | Not seen | Subfolders `/en-us`, `/en-gb`; no hreflang found in head | 6 locale sitemap indexes |
| **Mulberry** | Country subfolders `/gb/`, `/ca/`, `/de/`… | Not seen | Not seen | Not seen | 48 hreflang tags | Per-region index |

## What established brands do well (verified)
1. Clean, readable URLs. Shopify `/products/{name}`; Secrid `/{lang}-{country}/wallets/{model}/`.
2. Secrid's Wallet Guide is the strongest content asset seen: a ~2,000-word guide with FAQ that links to products, collections and care content.
3. Ekster combines FAQ copy on the collection page with visible proof (rating, returns, warranty) and ships a wallet-chooser quiz.
4. Smythson shows a full product breadcrumb and specific specs (card slots, dimensions) on product pages.
5. Loewe and Strathberry write descriptive image alt text.
6. Montblanc, Mulberry and Secrid are built for multi-market SEO: per-locale sitemaps and robots.txt that block filter/sort parameters.

## Weaknesses and gaps (verified)
- Collection copy is thin or missing almost everywhere (12 to ~65 words) or sits below the grid.
- Empty or logo-only alt text (Bellroy, Ekster, Secrid).
- Little or no wallet-specific buying, gift or care content at Smythson, Loewe and Strathberry. Bellroy has no buying or gift guide.
- Specs are often missing on luxury product pages (Loewe ~18 words, no capacity).
- Breadcrumbs are weak or inconsistent.
- Hygiene errors: Bellroy hreflang conflict and unfilled template placeholder, Strathberry duplicate sitemap line, Loewe typo.
- Structured data could not be checked on any page. Do not assume it is absent; test the raw HTML.

## SERP read (US-only index; ordered results, not verified positions)
| Query | Who ranks | Read |
|---|---|---|
| luxury wallets | editorial (Resident, FashionBeans, The Manual), Trayvax blog, bestbuy.ca | roundup-led |
| luxury leather wallets | bestbuy.ca, Camille Fournet, Braun Buffel blog, 2men.it, Highsnobiety, SageBrown | mixed, small brands present |
| designer wallets for men | SSENSE, Balmain, Hugo Boss, Bloomingdale's, GiftList, The Luxury Editor | houses and department stores |
| premium wallets for men | R.M. Williams, Very, Walmart, thin and spam pages | weak and fragmented: opening |
| luxury minimalist wallet | Trayvax blog (2), Luxe Digital, brand blogs | small brands rank |
| luxury card holder | Louis Vuitton, Harrods, Secrid, editorial | houses and department stores |
| luxury gifts for men | Luxe Digital, Sotheby's journal, Tateossian blog (plus junk) | cross-category editorial |
| bifold vs minimalist wallet | ~8 small leather brands' own blogs | brand content wins |
| how to care for / choose a leather wallet | brand blogs almost exclusively | attainable |
| men's leather wallets uk gift | SageBrown (5 pages) + others | one DTC brand dominates with collection + gift posts + products |
| luxury wallets Canada | 1stDibs, Love That Bag, madeinca.ca, junk | weak and resale-skewed: gap |
| DE/FR/IT/ES/NL luxury queries | Boss, Bulgari, Montblanc, Armani, Zalando, eBay, marketplaces; FR: small French brands | no editorial layer in DE/IT; ES results skew to Mexico (unreliable) |
| "D'Vorsche" | no brand page; auto/racing results | brand SERP is open |
| "DVorsche" / "dvorsche wallet" | treated as Porsche; **Porsche Design wallets (one listed ~EUR 149)** and the Porsche shop | high confusion risk |

Junk and hijacked domains appear in several top slots (meetingguide.aa.org, m.fightcancer.org, do2.dr-chuck.com and others). They were ignored for analysis.

## Realistic targets for a new brand
**Attainable first** (brand-blog or thin SERPs): how to choose a leather wallet, bifold vs minimalist wallet, how to care for a leather wallet, premium wallets for men, luxury leather wallets (collection page), UK wallet-gift queries, branded terms.
**Earn through PR, not pages**: best luxury wallets, best wallets for men, wallet under $200, luxury gifts for men.
**Target later**: luxury wallets, luxury card holder, designer wallets for men, and the DE/IT/NL luxury head terms.

## Underserved intents (supported by the gaps above)
Leather type education; wallet-specific care; capacity and size guides (how many cards fit, slim vs bifold); bifold vs card holder comparisons; gift intent under about $150 with concrete wallet picks; a "which wallet is right" chooser; personalization pages (only Secrid and Smythson have them).

## How D'Vorsche should differ rather than copy
- Publish the specs competitors omit (capacity, dimensions, materials) once verified.
- Put a short, useful intro above the product grid, not below.
- Build one guide that genuinely answers the buying decision (the Secrid model), in the brand's quieter voice.
- Fill alt text with accurate descriptions.
- Keep the Art Deco, understated look. Do not mimic mass-market trust badges.
- Avoid heritage or origin claims that cannot be verified.

## Authority and PR evidence
See `international-and-authority.md`.
