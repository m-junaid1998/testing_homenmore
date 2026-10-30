import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shop from "@/screens/Shop";
import { PrefillQueries } from "@/api/PrefillQueries";
import { prefetch } from "@/api/prefetch";
import { QA } from "@/api/queryArgs";
import { getShippingRules, serverGet } from "@/server/ssr";
import { JsonLd } from "@/components/JsonLd";
import { SeoFaq } from "@/components/SeoFaq";
import { buildCatalogParams, fromSearchParams } from "@/utils/catalog";
import { storeFaqs } from "@/utils/storeFacts";
import { SITE_URL, categoryPath, slugify } from "@/utils/seo";

type Params = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;
type Cat = { _id: string; categoryname: string; subCategories?: string[] };

async function findCategory(slug: string) {
  const res = await serverGet<{ data: Cat[] }>("/categories/allcategories", { isAllRecord: true }, { tag: "categories", strict: true });
  const list = res?.data ?? [];
  return { list, category: list.find((c) => slugify(c.categoryname) === slug) ?? null };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const name = category.categoryname;
  return {
    title: `Buy ${name} Online in Pakistan`,
    description: `Shop ${name.toLowerCase()} online at Bambotia. Cash on delivery, 5% off on online payment and delivery across Pakistan including Karachi, Lahore and Islamabad.`,
    alternates: { canonical: categoryPath(name) },
  };
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) notFound();

  const get = fromSearchParams(await searchParams);
  const entry = await prefetch(QA.catalog(buildCatalogParams(get, category._id)), "products");
  const name = category.categoryname;
  const subs = category.subCategories ?? [];

  return (
    <>
      <PrefillQueries entries={[entry]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${categoryPath(name)}` },
          ],
        }}
      />
      <Suspense fallback={<main className="page-container min-h-svh" />}>
        <Shop fixedCategoryId={category._id} />
      </Suspense>

      <section className="page-container pt-6 text-sm leading-7 text-[var(--color-muted-foreground)]">
        <h2 className="font-display text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">{name} at Bambotia</h2>
        <p className="mt-3">
          Explore our {name.toLowerCase()} collection and order online with delivery to Karachi, Lahore, Islamabad and the rest of Pakistan.
          Every piece is listed with its price in PKR and current stock, so you can order with confidence.
        </p>
        {subs.length > 0 && (
          <p className="mt-3">
            Browse by style:{" "}
            {subs.map((s, i) => (
              <span key={s}>
                {i > 0 && ", "}
                <Link href={`${categoryPath(name)}?sub=${encodeURIComponent(s)}`} className="text-[var(--color-gold)] underline underline-offset-2">
                  {s}
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </section>
      <SeoFaq title={`${name}: Frequently Asked Questions`} faqs={storeFaqs(await getShippingRules())} />
    </>
  );
}
