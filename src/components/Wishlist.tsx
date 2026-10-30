"use client";

import type { ReactNode } from "react";
import { Trash2, Heart, ArrowRight } from "lucide-react";
import { Link } from "../lib/router-compat";
import { useWishlist } from "../hooks/useWishList";
import { Skeleton } from "./Skeleton";
import ProductCard from "../screens/ProductCard";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
const Shell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen bg-[var(--color-bg-light)] py-12 font-sans text-[var(--color-text-dark)]"><div className="page-container">{children}</div></main>
);

export const Wishlist = () => {
  const { wishlistProducts: items, isLoadingWishlist, clearWishlist, isWishlistMutationLoading } = useWishlist();
  if (isLoadingWishlist) return (
    <Shell><Skeleton className="h-10 w-48 rounded-xl mb-6" /><div className={GRID}>{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rectangular" className="aspect-[4/5] rounded-2xl" />)}</div></Shell>
  );
  if (!items.length) return (
    <main className="min-h-screen bg-[var(--color-bg-light)] flex flex-col items-center justify-center text-center px-4 font-sans text-[var(--color-text-dark)]">
      <div className="w-20 h-20 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] flex items-center justify-center mb-6 text-[var(--color-muted)] shadow-sm"><Heart size={36} strokeWidth={1.5} /></div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Your Wishlist is Empty</h1>
      <p className="text-[var(--color-muted)] text-xs sm:text-sm max-w-sm mb-8">Explore our jewellery collections and save your favourite pieces.</p>
      <Link to="/shop" className="inline-flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-foreground)] text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all"><span>Explore Products</span><ArrowRight size={16} /></Link>
    </main>
  );
  return (
    <Shell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[var(--color-border)]">
        <div><h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">My Wishlist</h1><p className="text-[var(--color-muted)] text-xs sm:text-sm mt-1">Saved items ({items.length})</p></div>
        <button type="button" onClick={() => clearWishlist()} disabled={isWishlistMutationLoading} className="self-start sm:self-auto text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-danger)] disabled:opacity-50 transition-colors flex items-center space-x-1 cursor-pointer"><Trash2 size={14} /><span>Clear Wishlist</span></button>
      </div>
      <div className={GRID}>{items.map((p: any) => <ProductCard key={p._id} product={p} />)}</div>
    </Shell>
  );
};

export default Wishlist;
