# International SEO and authority building

## Evidence used
- Google Search Central, *Managing multi-regional and multilingual sites*: ccTLD = clear country signal but costly and one country each; subdomains = easy setup but users cannot always tell the country; subdirectories = easy, low maintenance; URL parameters not recommended. Avoid automatic redirects between language versions. Source: developers.google.com/search/docs/specialty/international/managing-multi-regional-sites (fetched 2026-10-24).
- Google, *Localized versions*: hreflang needs return links or it is ignored; each version lists itself and the others; `x-default` is the fallback; valid as `<link>`, HTTP header or sitemap. Source: developers.google.com/search/docs/specialty/international/localized-versions.
- Google, *Locale-adaptive pages*: Googlebot mostly crawls from US IPs with no `Accept-Language`, so content that changes by visitor locale may not be fully crawled; use separate locale URLs with hreflang.
- Ahrefs (Mar 2025, Sep 2024) recommends subdirectories when starting from scratch and against IP/cookie redirects. This is a secondary source; its 67% hreflang-error figure is the vendor's own and unchecked.
- What competitors do (verified from raw HTML): Secrid, Mulberry and Smythson/Ekster use subfolders with hreflang; Strathberry uses country subdomains; Bellroy is one global site with no hreflang; Montblanc and Dunhill show no hreflang in the head (may use sitemaps, unverified). Smythson and Ekster map many countries to a few buckets (`/en-eu`, `/en-int`), a low-cost launch pattern.

## Recommendation
**Phase 1 (now): one English storefront on one domain, USD, no hreflang.** There is only one version of each page, so hreflang would be invalid or pointless. Authority consolidates on one host. Lowest cost, and the strongest fit for a new brand with one product line.

**Phase 2: subdirectories on the same domain**, added only when a market has local pricing, shipping and a real reason to exist:
1. `/en-gb/` once GBP pricing, UK shipping, duties and returns are real. UK has the clearest gifting opportunity in the SERP read.
2. `/en-ca/` once CAD and Canadian shipping are real. The Canadian SERP looked weak and resale-led.
3. `/en-eu/` as a single English bucket for EU countries (the Smythson/Ekster pattern), before translating.
4. Translated folders (`/de-de/`, `/fr-fr/`, then `/it-it/`, `/nl-nl/`) only when sales or search data justify the translation and local support. Do not machine-translate.

**Why not ccTLDs or subdomains:** split authority, higher cost, and more infrastructure for a single-product launch.

### When Phase 2 starts, implement
- Reciprocal, self-referencing hreflang (`en-us`, `en-gb`, `en-ca`, `en-eu`) plus `x-default` pointing at the US storefront or a selector.
- Self-referencing canonicals on every version. Hreflang must point to canonical URLs.
- Localised currency, prices, spelling, shipping and returns copy so near-duplicate English pages are genuinely different.
- A visible country/currency selector. No IP- or Accept-Language-based forced redirects; a dismissible suggestion banner is acceptable.
- One sitemap group per locale (the Secrid and Montblanc pattern), or hreflang entries in the sitemap.

### Market order (qualitative, from the SERP read; no volume data)
1. **United States**: largest English market; head terms are hard, so lead with collection, guides and PR.
2. **United Kingdom**: open gift SERP, a DTC competitor shows the pattern works; needs GBP and UK shipping.
3. **Canada**: weak SERP, needs CAD and CA shipping to convert.
4. **Germany**: the largest EU market in the read, transactional with no editorial layer; needs German copy and EU shipping/VAT.
5. **France, Netherlands, Italy**: later; Italy is house-dominated, France has small-brand competition, Netherlands is mainstream-led.
6. **Spain, Switzerland**: unreliable data here (the search index skewed to Mexico for Spanish; Switzerland not tested). Research again with a proper tool before deciding.
Priorities should be revisited with Search Console and sales data after launch. No market has been validated by volumes.

### Not implemented (and why)
No hreflang, locale folders, currency selector or translated pages: the storefront only prices and ships in USD (`src/lib/pricing.ts`), so localized pages would be fake. The `html lang="en"` and `og:locale en_US` are set.

## Authority and digital PR
**What the evidence shows**
- Verified roundups that include DTC and mid-price brands: FashionBeans (card-holder guide lists Luca Faloni, Oliver Cabell, Ridge, Bellroy, Ekster, Roderer), Gear Patrol (31 picks, 22 under $200, many DTC; dated Jan 2023). FashionBeans' 2026 luxury list (27 Aug 2026) is mostly houses; Wolf (under $100) is the only price stated.
- Search-snippet only (unverified): Forbes Vetted, Mr Porter Journal ($300-470 picks), The Gentleman's Journal (Ettinger £185, Aspinal, Charles Laurie), Boss Hunting ("every price point"), Luxe Digital, T3, Stylerave.
- Not reachable or not found: current GQ, Esquire, Wired, Wirecutter, Men's Health, Hypebeast, Highsnobiety roundups.
- Pitch routes verified on a page: Gear Patrol ("Pitch a Product", works with brands, no guarantee of coverage); Uncrate (contact form "Submissions"); The Gentleman's Journal (editorial email). Wirecutter reportedly does not accept unsolicited samples (webinar recap, unverified).
- Press-page examples: Ekster (press page with media kit and sample requests) and Oliver Cabell ("as seen in" logos). No verifiable digital-PR campaign by a wallet brand was found.

**Strategy (nothing below has been done)**
1. **Build the press foundation first**: a press/media page with brand facts, logo downloads, product images, and a press contact. Only list publications that have actually covered the brand.
2. **Roundup inclusion**: pitch FashionBeans-type and Gear Patrol-type editors with a short, specific note: price band ($150), what is distinctive, high-res images, sample on request. Target UK gentleman's titles (The Gentleman's Journal) once UK shipping exists.
3. **Gift guides**: seasonal (Father's Day, holiday). Pitch 8 to 10 weeks ahead.
4. **Creators and reviewers**: leather-goods reviewers and everyday-carry creators; send samples with disclosure expectations clear; never pay for links.
5. **Original resource (only if real)**: e.g. a verified data-driven guide on wallet capacity or leather care that others would cite. Do not invent research.
6. **Collaborations** that fit the positioning (design, heritage-adjacent craft partners), not discount-led.

**Avoid**: paid links, PBNs, mass guest posts, automated outreach, fake press.

**Measures** (set targets after a baseline): referring domains from relevant editorial sites, number of roundup inclusions, branded search impressions, referral sessions and conversions from editorial links.

## Trademark note affecting all of this
Searching "dvorsche wallet" returned Porsche Design wallets and shop.porsche.com in the results (one Porsche Design wallet listed around EUR 149, the same price band). The search engine also appears to correct "DVorsche" toward "Porsche". This is not a legal conclusion; it is a reason to get trademark counsel's view before investing in branded SEO and PR.
