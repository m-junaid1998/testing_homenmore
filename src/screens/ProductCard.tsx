"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, ShoppingBag, Star } from "lucide-react";
import { useWishlist } from "../hooks/useWishList";
import { useCart } from "../hooks/useCart";
import cloudinaryLoader from "../lib/cloudinaryLoader";
import { colorHex, productPath } from "../utils/seo";
import type { Product } from "../utils/types";

const SIZES = "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw";
const BTN = "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50";

/**
 * Product tile. It keeps no state of its own: colours and sizes are links to the product page
 * (/product/name?color=Red) where the shopper picks them, so products with options never get added "blind".
 */
function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist, isWishlistMutationLoading } = useWishlist();
  const { addToCart, isCartMutationLoading } = useCart(false); // no cart query per card: the server checks stock

  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];
  const hasOptions = sizes.length > 0 || colors.length > 0;

  const cheapest = sizes.length ? sizes.reduce((min, s) => (s.salePrice < min.salePrice ? s : min), sizes[0]) : product;
  const discount = cheapest.discount && cheapest.discount !== "0%" ? String(cheapest.discount).replace("-", "") : null;
  const href = productPath(product);
  const [first, second] = product.images ?? [];
  const category = typeof product.categoryname === "object" ? product.categoryname?.categoryname : product.categoryname;
  const label = product.subCategory && product.subCategory !== "None" ? product.subCategory : category;
  const soldOut = product.stock <= 0;
  const liked = isInWishlist(product._id);
  const reviews = Number(product.numReviews) || 0;

  const add = () => addToCart(product._id, 1, false, { successMessage: `Added ${product.name} to cart` });
  const buyNow = async () => (await addToCart(product._id, 1, false))?.success && router.push("/checkout");

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-500 hover:border-[var(--gold)] hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-background)]">
        <Link href={href} aria-label={product.name} className="absolute inset-0 block">
          {first && <Image loader={cloudinaryLoader} src={first} alt={product.name} fill sizes={SIZES} priority={priority} className="object-cover transition-transform duration-700 group-hover:scale-105" />}
          {second && <Image loader={cloudinaryLoader} src={second} alt="" fill sizes={SIZES} className="hidden object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" />}
        </Link>

        {product.isNewArrival && <span className="absolute left-1.5 top-1 rounded-full bg-[var(--gold)] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--on-gold)]">New</span>}
        {discount && <span className="absolute bottom-1 right-1 rounded-md bg-red-600 px-1 py-0.5 text-[11px] font-black uppercase tracking-widest text-white">-{discount}</span>}
        {soldOut && <span className="absolute inset-0 grid place-items-center bg-black/55 text-[11px] font-extrabold uppercase tracking-widest text-white">Out of stock</span>}

        <button
          type="button"
          disabled={isWishlistMutationLoading}
          onClick={() => toggleWishlist(product._id, { successMessage: `${liked ? "Removed from wishlist:" : "Added to wishlist:"} ${product.name}` })}
          aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-1.5 top-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[var(--color-background)]/80 shadow-sm backdrop-blur-md transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Heart size={16} className={liked ? "fill-[var(--color-danger)] text-[var(--color-danger)]" : "stroke-[1.5]"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        {label && <span className="mb-1 block truncate text-[11px] font-extrabold uppercase tracking-wider text-[var(--gold)]">{label}</span>}
        <h3 className="mb-0.5 line-clamp-1 text-sm font-bold md:text-base">
          <Link href={href} className="hover:text-[var(--gold)]">{product.name}</Link>
        </h3>

        {reviews > 0 && (
          <p className="mb-2 flex items-center gap-1 text-[11px] text-[var(--color-muted-foreground)]" aria-label={`Rated ${Number(product.ratings).toFixed(1)} out of 5 from ${reviews} reviews`}>
            <Star size={13} className="fill-[var(--gold)] text-[var(--gold)]" />
            <b className="text-[var(--color-foreground)]">{Number(product.ratings).toFixed(1)}</b> ({reviews})
          </p>
        )}

        {colors.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {colors.slice(0, 6).map((color) => (
              <Link key={color} href={`${href}?color=${encodeURIComponent(color)}`} title={color} aria-label={`Choose colour ${color}`} className="h-5 w-5 rounded-full border border-[var(--color-border)] ring-offset-1 hover:ring-2 hover:ring-[var(--gold)]" style={{ background: colorHex(product, color) }} />
            ))}
          </div>
        )}
        {sizes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {sizes.slice(0, 5).map((s) => (
              <Link key={s.label} href={`${href}?size=${encodeURIComponent(s.label)}`} className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-bold hover:border-[var(--gold)]">{s.label}</Link>
            ))}
          </div>
        )}

        <div className="mt-auto pt-0.5">
          <p className="mb-1.5 flex min-h-7 flex-wrap items-baseline gap-x-1.5">
            {sizes.length > 1 && <span className="text-xs text-[var(--color-muted-foreground)]">From</span>}
            <span className="text-base font-black text-[var(--color-primary)] md:text-lg">Rs. {cheapest.salePrice?.toLocaleString()}</span>
            {cheapest.regularPrice > cheapest.salePrice && <span className="text-xs text-[var(--color-muted-foreground)] line-through">Rs. {cheapest.regularPrice?.toLocaleString()}</span>}
          </p>

          <p
            className={`mb-1.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] font-bold transition-all duration-300 ${soldOut
                ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)]"
                : "border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)] dark:border-[var(--color-success)]/30 dark:bg-[var(--color-success)]/5 dark:text-[var(--color-success)]"
              }`}
          >
            {soldOut ? "Out of stock" : `Stock: ${product.stock}`}
          </p>

          <div className="flex flex-col gap-1.5">
            {hasOptions ? (
              <>
                <Link href={href} className={`${BTN} border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-border)]`}><ShoppingBag size={14} /> Select options</Link>
                <Link href={href} className={`${BTN} bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:brightness-110`}>Buy now <ArrowRight size={14} /></Link>
              </>
            ) : (
              <>
                <button type="button" disabled={soldOut || isCartMutationLoading} onClick={add} className={`${BTN} border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-border)]`}><ShoppingBag size={14} /> Add to cart</button>
                <button type="button" disabled={soldOut || isCartMutationLoading} onClick={buyNow} className={`${BTN} bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:brightness-110`}>Buy now <ArrowRight size={14} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
