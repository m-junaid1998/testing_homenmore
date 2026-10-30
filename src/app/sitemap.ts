import type { MetadataRoute } from "next";
import { serverGet } from "@/server/ssr";
import { SITE_URL, categoryPath, productPath } from "@/utils/seo";
import { posts } from "@/content/blog";

// Built from live data on request (cached for an hour); not prerendered, so the build needs no database.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];
const url = (path: string) => `${SITE_URL}${path}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    serverGet<{ data: any[] }>("/products/allproducts", { isAllRecord: true, isPublished: true, fields: "full" }, { tag: "products", revalidate: 3600 }),
    serverGet<{ data: any[] }>("/categories/allcategories", { isAllRecord: true }, { tag: "categories", revalidate: 3600 }),
  ]);
  const now = new Date();

  const fixed: Entry[] = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...["karachi", "lahore", "islamabad"].map((c): Entry => ({ url: url(`/jewellery-in/${c}`), lastModified: now, changeFrequency: "weekly", priority: 0.7 })),
    { url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: url("/aboutus"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...fixed,
    ...(categories?.data ?? []).map((c): Entry => ({ url: url(categoryPath(c.categoryname)), lastModified: now, changeFrequency: "daily", priority: 0.9 })),
    ...(products?.data ?? []).map((p): Entry => ({
      url: url(productPath(p)),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
      images: p.images?.slice(0, 3),
    })),
    ...posts.map((p): Entry => ({ url: url(`/blog/${p.slug}`), lastModified: new Date(p.updated), changeFrequency: "monthly", priority: 0.5 })),
  ];
}
