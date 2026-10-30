"use client";

import { useNewArrivals } from "../hooks/useProduct";
import ProductCard from "./ProductCard";
import { Skeleton } from "../components/Skeleton";
import { PRODUCT_GRID, SECTION, SectionTitle } from "../components/SectionTitle";
import type { Product } from "../utils/types";

export default function NewArrivals() {
  const { products, isLoadingProducts } = useNewArrivals();
  if (!isLoadingProducts && products.length === 0) return null; // nothing new this week: no empty box on the home page

  return (
    <section aria-label="New arrivals" className={SECTION}>
      <SectionTitle title="New arrivals" subtitle="Added in the last 7 days" href="/shop?newArrival=true" />
      <div className={PRODUCT_GRID}>
        {isLoadingProducts
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" className="aspect-[4/5]" />)
          : products.map((product: Product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
