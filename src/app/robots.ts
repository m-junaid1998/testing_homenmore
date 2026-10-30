import type { MetadataRoute } from "next";
import { SITE_URL } from "@/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // account, cart and back-office pages have no search value; /api is JSON
        disallow: ["/admin", "/api/", "/checkout", "/orders", "/myprofile", "/wishlist", "/login", "/signup"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
