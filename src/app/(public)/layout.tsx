import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LazyWhatsApp from "@/components/LazyWhatsApp";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { PrefillQueries } from "@/api/PrefillQueries";
import { prefetch } from "@/api/prefetch";
import { QA } from "@/api/queryArgs";
import { getShippingRules } from "@/server/ssr";

// Pages read live shop data on the server; nothing is prerendered at build time (the build needs no database).
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Menu categories and delivery rules are needed on every page: fetched once on the server (cached),
  // so the menu links and prices are in the HTML and the browser does not ask again.
  const [categories, shipping, rules] = await Promise.all([
    prefetch(QA.categories, "categories"),
    prefetch(QA.shipping, "settings"),
    getShippingRules(),
  ]);

  return (
    <>
      <PrefillQueries entries={[categories, shipping]} />
      <AnnouncementBar rules={rules} />
      <Navbar />
      {children}
      <Footer />
      <LazyWhatsApp />
    </>
  );
}
