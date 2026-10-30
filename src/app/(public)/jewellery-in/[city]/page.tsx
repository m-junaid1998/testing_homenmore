import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/screens/ProductCard";
import { getShippingRules, serverGet } from "@/server/ssr";
import { JsonLd } from "@/components/JsonLd";
import { SeoFaq } from "@/components/SeoFaq";
import { storeFaqs } from "@/utils/storeFacts";
import { discountPercent, formatRs } from "@/utils/shipping";
import { SITE_NAME, SITE_URL, categoryPath } from "@/utils/seo";

const CITIES: Record<string, string> = { karachi: "Karachi", lahore: "Lahore", islamabad: "Islamabad" };

type Params = Promise<{ city: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city } = await params;
  const name = CITIES[city];
  if (!name) return { title: "Not found", robots: { index: false } };
  const rules = await getShippingRules();
  return {
    title: `Online Jewellery in ${name}: Bridal Sets, Earrings & Bangles`,
    description: `Order bridal jewellery sets, earrings, bangles and necklaces online and get them delivered in ${name}. Cash on delivery and ${discountPercent(rules)}% off on online payment.`,
    alternates: { canonical: `/jewellery-in/${city}` },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { city } = await params;
  const name = CITIES[city];
  if (!name) notFound();

  const rules = await getShippingRules();
  const [best, cats] = await Promise.all([
    serverGet<{ data: any[] }>("/products/best-sellers", { limit: 8 }, { tag: "products" }),
    serverGet<{ data: { _id: string; categoryname: string }[] }>("/categories/allcategories", { isAllRecord: true }, { tag: "categories" }),
  ]);
  const products = best?.data ?? [];

  return (
    <main className="page-container py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          areaServed: { "@type": "City", name },
        }}
      />
      <h1 className="font-display text-2xl font-semibold sm:text-4xl">Online Jewellery in {name}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">
        Bambotia delivers bridal sets, earrings, bangles and necklaces to {name}. Delivery is Rs. {rules.deliveryCharge} and free on orders above Rs.{" "}
        {formatRs(rules.freeShippingAbove)}. Pay cash on delivery, or pay online and get {discountPercent(rules)}% off.
      </p>

      {(cats?.data?.length ?? 0) > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {cats!.data.map((c) => (
            <li key={c._id}>
              <Link href={categoryPath(c.categoryname)} className="inline-block rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]">
                {c.categoryname}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl font-semibold sm:text-2xl">Popular pieces we deliver to {name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {products.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}

      <SeoFaq title={`Jewellery delivery in ${name}: FAQ`} faqs={storeFaqs(rules, name)} />
    </main>
  );
}
