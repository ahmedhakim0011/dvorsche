import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, transactional and non-content routes. This is crawl guidance only; access control is enforced in the app.
        disallow: ["/admin", "/api/", "/checkout", "/order/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
