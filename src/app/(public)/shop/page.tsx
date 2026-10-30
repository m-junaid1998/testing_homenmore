import { Suspense } from "react";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import Shop from "@/screens/Shop";
import { PrefillQueries } from "@/api/PrefillQueries";
import { prefetch } from "@/api/prefetch";
import { QA } from "@/api/queryArgs";
import { serverGet } from "@/server/ssr";
import { buildCatalogParams, fromSearchParams } from "@/utils/catalog";
import { categoryPath } from "@/utils/seo";

type SP = Promise<Record<string, string | string[] | undefined>>;

// Filtered / searched / sorted views are for shoppers, not for the index: they would create thousands of near-duplicate URLs.
const FILTER_KEYS = ["q", "minPrice", "maxPrice", "sort", "newArrival", "sub", "subCategory", "category"];

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = FILTER_KEYS.some((k) => sp[k]);
  return {
    title: "Shop Jewellery Online in Pakistan: Bridal Sets, Earrings, Bangles & Necklaces",
    description:
      "Browse the full Bambotia jewellery collection: bridal sets, earrings, bangles and necklaces with cash on delivery across Pakistan.",
    alternates: { canonical: "/shop" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const get = fromSearchParams(sp);

  // Old links like /shop?category=<id> now live at /category/<slug> (one indexable URL per category).
  const legacyId = get("category");
  if (legacyId) {
    const cats = await serverGet<{ data: { _id: string; categoryname: string }[] }>(
      "/categories/allcategories", { isAllRecord: true }, { tag: "categories" }
    );
    const cat = cats?.data?.find((c) => c._id === legacyId);
    if (cat) {
      const rest = new URLSearchParams();
      Object.entries(sp).forEach(([k, v]) => k !== "category" && typeof v === "string" && rest.set(k === "subCategory" ? "sub" : k, v));
      permanentRedirect(`${categoryPath(cat.categoryname)}${rest.toString() ? `?${rest}` : ""}`);
    }
  }

  const entry = await prefetch(QA.catalog(buildCatalogParams(get)), "products");

  return (
    <>
      <PrefillQueries entries={[entry]} />
      <Suspense fallback={<main className="page-container min-h-svh" />}>
        <Shop />
      </Suspense>
    </>
  );
}
