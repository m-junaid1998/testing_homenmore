import type { Metadata } from "next";
import Index from "@/screens/Index";
import { PrefillQueries } from "@/api/PrefillQueries";
import { prefetch } from "@/api/prefetch";
import { QA } from "@/api/queryArgs";

export const metadata: Metadata = {
  title: { absolute: "Bambotia | Online Jewellery Store Pakistan: Bridal Sets, Earrings, Bangles" },
  description:
    "Shop bridal jewellery sets, earrings, bangles and necklaces online in Pakistan. Cash on delivery, 5% off on online payment and delivery to Karachi, Lahore, Islamabad and all cities.",
  alternates: { canonical: "/" },
};

export default async function Page() {
  // Everything the home page shows is fetched on the server, in parallel, from the cached API layer.
  const entries = await Promise.all([
    prefetch(QA.carousel, "media"),
    prefetch(QA.reels, "media"),
    prefetch(QA.newArrivals, "products"),
    prefetch(QA.bestSellers(8), "products"),
    prefetch(QA.topRated(8), "products"),
    prefetch(QA.categoryImages, "catimages"),
  ]);

  return (
    <>
      <PrefillQueries entries={entries} />
      <Index />
    </>
  );
}
