import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    // Sorted and searched views are utility URLs: crawlable for discovery, but not indexed.
    return ["/shop", "/collections/:handle"].flatMap((source) =>
      ["q", "sort"].map((key) => ({ source, has: [{ type: "query" as const, key }], headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] })),
    );
  },
};

export default nextConfig;
