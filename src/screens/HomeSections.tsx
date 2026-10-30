"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useFeaturedProducts } from "@/hooks/useProduct";
import { useCategoryImages } from "@/hooks/useCategoryImage";
import { useCategories } from "@/hooks/useCategory";
import { categoryPath, cloudinaryUrl } from "@/utils/seo";
import ProductCard from "@/screens/ProductCard";
import NewArrivals from "./NewArrivals";
import { Skeleton } from "@/components/Skeleton";
import { PRODUCT_GRID, SECTION, SectionTitle } from "@/components/SectionTitle";

const ReelsSection = dynamic(() => import("./ReelsSection"));

function ProductRow({ title, subtitle, products, loading }: { title: string; subtitle: string; products: any[]; loading: boolean }) {
  if (!loading && products.length === 0) return null; // nothing to show: skip the whole section

  return (
    <section aria-label={title} className={SECTION}>
      <SectionTitle title={title} subtitle={subtitle} href="/shop" />
      <div className={PRODUCT_GRID}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" className="aspect-[4/5]" />)
          : products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

export default function HomeSections() {
  const { bestSellers, topRated, isLoadingBestSellers, isLoadingTopRated } = useFeaturedProducts(8);
  const { categoryImages, isLoadingCategoryImages } = useCategoryImages();
  const { categories } = useCategories();

  const tiles = categoryImages.map((ci: any) => {
    const cat = categories.find((c: any) => c.categoryname === ci.categoryName);
    const base = cat ? categoryPath(cat.categoryname) : "/shop";
    const href = cat && ci.subCategoryName ? `${base}?sub=${encodeURIComponent(ci.subCategoryName)}` : base;
    return { ...ci, href, label: ci.subCategoryName || ci.categoryName };
  });

  return (
    <>
      {(isLoadingCategoryImages || tiles.length > 0) && (
        <section aria-label="Shop by category" className={SECTION}>
          <SectionTitle title="Shop by category" subtitle="Find the piece for every occasion" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {isLoadingCategoryImages
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" className="aspect-square" />)
              : tiles.map((t: any) => (
                <Link key={t._id} href={t.href} className="group block text-center">
                  <div className="aspect-square overflow-hidden rounded-xl bg-[var(--color-card)]">
                    <img src={cloudinaryUrl(t.imageUrl, 360)} alt={`${t.label} jewellery`} width={180} height={180} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <span className="mt-2.5 block line-clamp-1 text-sm font-semibold group-hover:text-[var(--color-primary)]">{t.label}</span>
                </Link>
              ))}
          </div>
        </section>
      )}
      <ReelsSection />
      <NewArrivals />
      <ProductRow
        title="Best Sellers"
        subtitle="Customer favourites you'll love"
        products={bestSellers}
        loading={isLoadingBestSellers}
      />

      <ProductRow
        title="Top Rated"
        subtitle="Highest rated by our customers"
        products={topRated}
        loading={isLoadingTopRated}

      />
    </>
  );
}
