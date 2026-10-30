"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal,Heart,ShoppingBag,User,Menu,X,ChevronDown,Home,LayoutGrid,Mail, Plus, Minus } from "lucide-react";
import { useCategories } from "@/hooks/useCategory";
import { useCartCount } from "@/hooks/useCart";
import { useWishlistCount } from "@/hooks/useWishList";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { categoryPath } from "@/utils/seo";
import { ThemeToggle } from "@/components/ThemeToggle";

const CartDrawer = dynamic(() => import("@/components/CartDrawer").then((m) => m.CartDrawer), { ssr: false });

type Category = {
  _id: string;
  slug?: string;
  categoryname: string;
  subCategories?: string[];
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const user = useSelector((st: RootState) => st.auth.user);
  const { categories } = useCategories();
  const totalItemsCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const closeMenu = () => setIsOpen(false);

  const categoryLink = (cat: Category) => categoryPath(cat.categoryname);

  const renderCategories = (mobile = false) => {
    return categories.map((cat: Category) => {
      const id = cat._id || cat.categoryname;
      const subs = cat.subCategories ?? [];
      const hasSubs = subs.length > 0;

      if (!mobile) {
        return (
          <div key={id} className="group relative py-6">
            <Link
              href={categoryLink(cat)}
              className="flex items-center gap-1.5 uppercase transition-colors hover:text-[var(--color-primary)]"
            >
              {cat.categoryname}
              {hasSubs && (
                <ChevronDown
                  size={14}
                  className="opacity-70 transition-transform group-hover:rotate-180"
                />
              )}
            </Link>

            {hasSubs && (
              <div className="absolute left-0 top-full z-50 hidden w-56 rounded-b-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 shadow-xl group-hover:block">
                {subs.map((sub) => (
                  <Link
                    key={sub}
                    href={`${categoryLink(cat)}?sub=${encodeURIComponent(sub)}`}
                    className="block px-5 py-2.5 text-[11px] tracking-wider transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)]"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={id}>
          {hasSubs ? (
            <>
              <button
                type="button"
                onClick={() => setOpenSub(openSub === id ? null : id)}
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs tracking-wide ${
                  openSub === id
                    ? "bg-[var(--color-card)] text-[var(--color-primary)]"
                    : "text-[var(--color-foreground)]"
                }`}
              >
                {cat.categoryname}
                {openSub === id ? <Minus size={14} /> : <Plus size={14} />}
              </button>

              {openSub === id && (
                <div className="space-y-1.5 py-2 pl-4">
                  {subs.map((sub) => (
                    <Link
                      key={sub}
                      href={`${categoryLink(cat)}?sub=${encodeURIComponent(sub)}`}
                      onClick={closeMenu}
                      className="block py-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              href={categoryLink(cat)}
              onClick={closeMenu}
              className="block px-3 py-2 text-xs tracking-wide hover:text-[var(--color-primary)]"
            >
              {cat.categoryname}
            </Link>
          )}
        </div>
      );
    });
  };

  const iconLink =
    "transition-colors hover:text-[var(--color-primary)]";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 font-sans backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-2 sm:h-[72px]">
          <div className="flex min-w-[36px] items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={iconLink}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex flex-1 justify-center lg:flex-initial lg:justify-start">
            <Link
              href="/"
              aria-label="Home"
              className="relative flex h-12 w-28 shrink-0 items-center justify-center sm:h-14 sm:w-44"
            >
              <Image
                src="/logo.avif"
                alt="Bambotia - Artificial & Bridal Jewellery Pakistan"
                fill
                priority
                sizes="(max-width: 640px) 112px, 176px"
                className="object-contain "
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-semibold tracking-wide lg:flex">
            {renderCategories()}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            <ThemeToggle />

            <Link href="/wishlist" aria-label="Wishlist" className={`relative ${iconLink}`}>
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-[var(--color-primary-foreground)]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className={`relative ${iconLink}`}
            >
              <ShoppingBag size={22} />
              {totalItemsCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-[var(--color-primary-foreground)]">
                  {totalItemsCount}
                </span>
              )}
            </button>

            <Link
              href={user ? "/myprofile" : "/login"}
              aria-label="Account"
              className={`hidden sm:block ${iconLink}`}
            >
              <User size={22} />
            </Link>
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMenu}
          />

          <aside className="relative z-10 flex h-full w-[300px] max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-background)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/50 p-4">
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className={iconLink}
              >
                <X size={24} />
              </button>

              <Link href="/" onClick={closeMenu} className="relative h-12 w-28">
                <Image
                  src="/logo.avif"
                  alt="Logo"
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </Link>

              <div className="w-6" />
            </div>

            <nav className="flex-1 space-y-4 p-4 text-sm font-medium">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3 py-1 hover:text-[var(--color-primary)]">
                <Home size={18} className="text-[var(--color-primary)]" /> Home
              </Link>

              <div>
                <button
                  type="button"
                  onClick={() => setCatOpen(!catOpen)}
                  className="flex w-full items-center justify-between py-1 hover:text-[var(--color-primary)]"
                >
                  <span className="flex items-center gap-3">
                    <LayoutGrid size={18} className="text-[var(--color-primary)]" />
                    Categories
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>

                {catOpen && (
                  <div className="mt-2 space-y-2 border-l border-[var(--color-border)] pl-4">
                    {renderCategories(true)}
                  </div>
                )}
              </div>

              <Link href="/shop" onClick={closeMenu} className="flex items-center gap-3 py-1 hover:text-[var(--color-primary)]">
                <SlidersHorizontal size={18} className="text-[var(--color-primary)]" /> Shop All
              </Link>

              <Link href="/orders" onClick={closeMenu} className="flex items-center gap-3 py-1 hover:text-[var(--color-primary)]">
                <ShoppingBag size={18} className="text-[var(--color-primary)]" /> My Orders
              </Link>

              <Link href={user ? "/myprofile" : "/login"} onClick={closeMenu} className="flex items-center gap-3 py-1 hover:text-[var(--color-primary)]">
                <User size={18} className="text-[var(--color-primary)]" /> {user ? "My Account" : "Sign In"}
              </Link>

              <Link href="/contact" onClick={closeMenu} className="flex items-center gap-3 py-1 hover:text-[var(--color-primary)]">
                <Mail size={18} className="text-[var(--color-primary)]" /> Contact Us
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {cartOpen && <CartDrawer isOpen onClose={() => setCartOpen(false)} />}
    </>
  );
}