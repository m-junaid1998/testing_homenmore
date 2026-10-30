import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetail from "@/screens/ProductDetail";
import { PrefillQueries } from "@/api/PrefillQueries";
import { QA } from "@/api/queryArgs";
import { serverGet } from "@/server/ssr";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, categoryPath, productPath, truncate } from "@/utils/seo";

type Params = Promise<{ slug: string }>;

// The URL holds the product name (slug). An old link with the product id still works and is redirected to the name URL.
// cache(): generateMetadata and the page share one lookup instead of running it twice.
const loadProduct = cache(async (param: string) => {
  const res = await serverGet<{ data: any }>(`/products/product/${encodeURIComponent(param)}`, {}, { tag: "products", strict: true });
  return res?.data ?? null;
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  if (!product || product.isPublished === false) return { title: "Product not found", robots: { index: false } };

  const category = product.categoryname?.categoryname;
  const path = productPath(product);
  const image = product.images?.[0];
  const description = truncate(
    product.description || `${product.name}${category ? ` from our ${category} collection` : ""}. Order online with delivery across Pakistan.`
  );
  return {
    title: `${product.name}${category ? ` | ${category}` : ""} Price in Pakistan`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: product.name, description, images: image ? [{ url: image, alt: product.name }] : undefined },
    twitter: { card: "summary_large_image", title: product.name, description, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const canonical = productPath(product);
  if (decodeURIComponent(`/product/${slug}`) !== canonical) permanentRedirect(canonical);

  // The product is already loaded: hand it to the browser cache instead of fetching it a second time.
  // "You may also like" is not awaited here: it loads in the browser so the page is not held back by a second query.
  const detail = { arg: QA.product(product._id), value: { success: true, data: product } };

  const url = `${SITE_URL}${canonical}`;
  const category = product.categoryname;
  const inStock = product.isPublished !== false && product.stock > 0;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    image: product.images,
    description: truncate(product.description || product.name, 500),
    sku: String(product._id),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: category?.categoryname,
    ...(product.numReviews > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.ratings).toFixed(1), reviewCount: product.numReviews },
    }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: product.salePrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(category ? [{ "@type": "ListItem", position: 2, name: category.categoryname, item: `${SITE_URL}${categoryPath(category.categoryname)}` }] : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: product.name, item: url },
    ],
  };

  return (
    <>
      <PrefillQueries entries={[detail]} />
      <JsonLd data={[productSchema, breadcrumbs]} />
      <ProductDetail id={product._id} />
    </>
  );
}
