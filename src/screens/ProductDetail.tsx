"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Sparkles, Star } from "lucide-react";
import { toast } from "@/utils/toast";
import { useProductDetail } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishList";
import { useShippingRules } from "@/hooks/useShipping";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/Skeleton";
import ProductCard from "@/screens/ProductCard";
import { ProductGallery } from "@/screens/ProductGallery";
import { colorHex, categoryPath } from "@/utils/seo";
import { formatPKR, priceForSize } from "@/utils/helper";
import { deliveryFor, ORDER_WHATSAPP } from "@/utils/shipping";
import Image from "next/image";

// The review form pulls in react-hook-form + zod: its own chunk, loaded after the page.
const CustomerReviews = dynamic(() => import("@/components/CustomerReviews").then((m) => m.CustomerReviews), { loading: () => <Skeleton className="h-64 rounded-2xl" /> });

const BTN = "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const MUTED = "text-[var(--color-muted-foreground)]";

/** A row of choices (sizes or colours). `swatch` draws a colour dot in front of the name. */
function Choice({ label, value, options, onPick, swatch }: { label: string; value: string; options: { name: string; hint?: string }[]; onPick: (name: string) => void; swatch?: (name: string) => string }) {
  return (
    <div>
      <p className={`mb-2 text-xs uppercase tracking-wider ${MUTED}`}>{label}{value && <span className="normal-case text-[var(--color-foreground)]"> - {value}</span>}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ name, hint }) => (
          <button key={name} type="button" aria-pressed={value === name} onClick={() => onPick(name)}
            className={`flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm ${value === name ? "border-[var(--color-primary)] bg-[var(--color-primary)] font-bold text-[var(--color-primary-foreground)]" : "border-[var(--color-border)]"}`}>
            {swatch && <span className="h-4 w-4 rounded-full border border-black/20" style={{ background: swatch(name) }} />}
            {name}{hint && <span className="ml-1 text-xs opacity-70">{hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// A size / colour from the link (?size=...) when it exists, else the only option, else nothing selected yet.
const initial = (names: string[], wanted: string | null) => (wanted && names.includes(wanted) ? wanted : names.length === 1 ? names[0] : "");

function ProductView({ product, related }: { product: any; related: any[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const rules = useShippingRules();
  const { addToCart, isCartMutationLoading, getItemQty } = useCart(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const sizes: { label: string; salePrice: number }[] = product.sizes ?? [];
  const colors: string[] = product.colors ?? [];
  const [size, setSize] = useState(() => initial(sizes.map((s) => s.label), params.get("size")));
  const [color, setColor] = useState(() => initial(colors, params.get("color")));
  const [qty, setQty] = useState(1);

  const price = priceForSize(product, size);
  const stockLeft = Math.max(0, (product.stock ?? 0) - getItemQty(product._id));
  const unavailable = product.isPublished === false || product.stock <= 0;
  const wished = isInWishlist(product._id);
  const category = typeof product.categoryname === "object" ? product.categoryname : null;

  const problem = () =>
    sizes.length && !size ? "Please select a size." : colors.length && !color ? "Please select a color." : qty > stockLeft ? `Only ${product.stock} unit(s) available in stock.` : "";
  const add = async (successMessage: string) => {
    const error = problem();
    if (error) {
      toast.error(error);
      return false;
    }
    return !!(await addToCart(product._id, qty, false, { size: size || undefined, color: color || undefined, successMessage }))?.success;
  };
  const buyNow = async () => (await add("")) && router.push("/checkout");

  const orderOnWhatsApp = () => {
    const error = problem();
    if (error) return toast.error(error);
    const subtotal = price.salePrice * qty;
    const delivery = deliveryFor(subtotal, rules);
    const message = [
      "Hi Bambotia, I would like to order:",
      "",
      `*Product:* ${product.name}`,
      ...(size ? [`*Size:* ${size}`] : []),
      ...(color ? [`*Color:* ${color}`] : []),
      `*Quantity:* ${qty}`,
      `*Price:* ${formatPKR(price.salePrice)} each`,
      `*Subtotal:* ${formatPKR(subtotal)}`,
      `*Delivery Charges:* ${formatPKR(delivery)}`,
      `*Total:* ${formatPKR(subtotal + delivery)}`,
      "",
      `*Product Link:* ${window.location.origin}/product/${product.slug ?? product._id}`,
    ].join("\n");
    window.open(`https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="page-container py-4 text-[var(--color-foreground)] sm:py-6">
      <Breadcrumb items={[{ label: "Home", link: "/" }, ...(category ? [{ label: category.categoryname, link: categoryPath(category.categoryname) }] : []), { label: product.name }]} />

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-8">
        <ProductGallery
          images={product.images ?? []}
          name={product.name}
          action={
            <button type="button" aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWishlist(product._id, { successMessage: wished ? "Removed from wishlist" : "Added to wishlist" })}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[var(--color-background)]/90 shadow-md backdrop-blur transition-transform hover:scale-110">
              <Heart size={20} className={wished ? "fill-[var(--color-danger)] text-[var(--color-danger)]" : ""} />
            </button>
          }
        />

        <div className="space-y-5">
          <div>
            {category && <span className={`text-xs uppercase tracking-wider ${MUTED}`}>{category.categoryname}{product.subCategory && product.subCategory !== "None" ? ` / ${product.subCategory}` : ""}</span>}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{product.name}</h1>
            {product.numReviews > 0 && <p className={`mt-2 flex items-center gap-1 text-sm ${MUTED}`}><Star size={14} className="fill-[var(--color-primary)] text-[var(--color-primary)]" /> {Number(product.ratings).toFixed(1)} ({product.numReviews} reviews)</p>}
          </div>

          <p className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--color-primary)]">{formatPKR(price.salePrice)}</span>
            {price.regularPrice > price.salePrice && <span className={`line-through ${MUTED}`}>{formatPKR(price.regularPrice)}</span>}
          </p>

          {sizes.length > 0 && <Choice label="Size" value={size} onPick={setSize} options={sizes.map((s) => ({ name: s.label, hint: formatPKR(s.salePrice) }))} />}
          {colors.length > 0 && <Choice label="Color" value={color} onPick={setColor} options={colors.map((name) => ({ name }))} swatch={(name) => colorHex(product, name)} />}

          <p className="text-sm">{unavailable ? <span className="font-semibold text-[var(--color-danger)]">Out of stock</span> : <span className="text-[var(--color-success)]">{product.stock} in stock</span>}</p>

          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="inline-flex h-12 items-center rounded-xl border border-[var(--color-border)]">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-full w-11 cursor-pointer place-items-center"><Minus size={14} /></button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(Math.max(1, stockLeft), qty + 1))} className="grid h-full w-11 cursor-pointer place-items-center"><Plus size={14} /></button>
              </div>
              <button type="button" disabled={unavailable || isCartMutationLoading} onClick={() => add(`"${product.name}" added to cart.`)} className={`${BTN} border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)]`}>
                <ShoppingBag size={16} /> Add to cart
              </button>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <button type="button" disabled={unavailable || isCartMutationLoading} onClick={buyNow} className={`${BTN} w-full min-w-0 justify-center gap-2 bg-[var(--color-primary)] text-white hover:brightness-110 sm:flex-1`}>
                <span>Buy it now</span>
                <ArrowRight size={16} className="shrink-0" />
              </button>
              <button type="button" disabled={unavailable} onClick={orderOnWhatsApp} className={`${BTN} w-full min-w-0 justify-center gap-2 bg-[#0B6B37] text-white hover:brightness-110 sm:flex-1`}>
                <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} className="block shrink-0" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
          {product.description && (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="shrink-0 text-[var(--color-primary)]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Description</h2>
              </div>
              <p className={`whitespace-pre-line leading-7 ${MUTED}`}> {product.description}</p>
            </section>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold uppercase tracking-wide">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </section>
      )}
      <section className="mt-14"><CustomerReviews productId={product._id} /></section>
    </main>
  );
}

export default function ProductDetail({ id }: { id: string }) {
  const { product, relatedProducts } = useProductDetail(id);
  if (!product) return <p className={`py-24 text-center ${MUTED}`}>This product could not be found.</p>;
  return <ProductView key={product._id} product={product} related={relatedProducts} />;
}
