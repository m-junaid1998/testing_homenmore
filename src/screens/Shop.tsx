"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronRight, ArrowUpDown, ArrowRight, LayoutGrid, Layers, Tag, Wallet, Sparkles, Search, SearchX, Check, ShoppingBag } from "lucide-react";
import { useCategories } from "@/hooks/useCategory";
import { useSearch } from "@/hooks/useSearch";
import ProductCard from "@/screens/ProductCard";
import { Skeleton } from "@/components/Skeleton";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SORTS, buildCatalogParams } from "@/utils/catalog";
import { categoryPath } from "@/utils/seo";

const GRID = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4";
const FIELD = "w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl outline-none focus:border-[var(--gold)]";
const MUTED = "text-[var(--color-muted-foreground)]";
const GOLD_BTN = "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gold)] text-[var(--on-gold)] font-bold cursor-pointer";
const GOLD_ICON = "grid place-items-center rounded-lg bg-[var(--gold-soft)] text-[var(--gold)]";
const CLEAR_BTN = "text-xs font-semibold text-[var(--gold)] cursor-pointer";

const Title = ({ icon: Icon, children }: { icon: any; children: ReactNode }) => (
  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight mb-3"><span className={`${GOLD_ICON} h-6 w-6`}><Icon size={13} /></span>{children}</h3>
);

const Scroller = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`-mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>{children}</div>
);

const Chip = ({ on, small, icon: Icon, onClick, children }: { on?: boolean; small?: boolean; icon?: any; onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap font-medium cursor-pointer transition-colors ${small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-[13px]"} ${on ? "bg-[var(--gold)] border-[var(--gold)] text-[var(--on-gold)]" : "bg-[var(--color-card)] border-[var(--color-border)]"}`}>
    {Icon && <Icon size={small ? 12 : 14} />}{children}
  </button>
);

export default function Shop({ fixedCategoryId }: { fixedCategoryId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { categories } = useCategories();
  const [sheetOpen, setSheetOpen] = useState(false);

  const catalogParams = buildCatalogParams((k) => sp.get(k), fixedCategoryId);
  const q = catalogParams.searchString;
  const category = catalogParams.category;
  const subCategory = catalogParams.subCategory;
  const minPrice = sp.get("minPrice") || "";
  const maxPrice = sp.get("maxPrice") || "";
  const sortKey = sp.get("sort") || "0";
  const newArrival = sp.get("newArrival") === "true";

  // Category changes move to the clean, indexable /category/<slug> URL; every other filter stays in the query string.
  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    let target = pathname;
    if ("category" in patch) {
      next.delete("category");
      next.delete("subCategory");
      next.delete("sub");
      const cat = categories.find((c: any) => c._id === patch.category);
      target = cat ? categoryPath(cat.categoryname) : "/shop";
      delete patch.category;
    }
    if ("subCategory" in patch) {
      next.delete("subCategory");
      if (patch.subCategory) next.set("sub", patch.subCategory);
      delete patch.subCategory;
    }
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const qs = next.toString();
    router.replace(qs ? `${target}?${qs}` : target, { scroll: false });
  };

  const clearAll = () => { router.replace("/shop", { scroll: false }); setSheetOpen(false); };

  const { products = [], resultsCount = 0, isLoadingSearch } = useSearch(catalogParams);

  const activeCategory = useMemo(() => categories.find((c: any) => c._id === category), [categories, category]);
  const hasFilters = !!(q || category || subCategory || minPrice || maxPrice || newArrival);
  const activeCount = [q, category, subCategory, minPrice || maxPrice, newArrival].filter(Boolean).length;
  const heading = activeCategory?.categoryname || "Artificial & Bridal Jewellery";
  const countText = `${resultsCount} product${resultsCount === 1 ? "" : "s"}`;

  const rowBtn = (on: boolean) => `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-left cursor-pointer transition-colors ${on ? "bg-[var(--gold-soft)] text-[var(--gold)] font-semibold" : "hover:bg-[var(--color-card)]"}`;

  const filters = (
    <div className="space-y-7">
      <div>
        <Title icon={LayoutGrid}>Category</Title>
        <div className="space-y-0.5">
          <button onClick={() => setParams({ category: null, subCategory: null })} className={rowBtn(!category)}>All products {!category && <Check size={15} />}</button>
          {categories.map((c: any) => (
            <div key={c._id}>
              <button onClick={() => setParams({ category: c._id, subCategory: null })} className={rowBtn(category === c._id)}>
                {c.categoryname}{category === c._id ? <Check size={15} /> : <ChevronRight size={15} className={MUTED} />}
              </button>
              {category === c._id && c.subCategories?.length > 0 && (
                <div className="ml-5 mt-1 mb-2 pl-3 border-l-2 border-[var(--color-border)] space-y-0.5">
                  {c.subCategories.map((sub: string) => (
                    <button key={sub} onClick={() => setParams({ subCategory: subCategory === sub ? null : sub })} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-left cursor-pointer ${subCategory === sub ? "text-[var(--gold)] font-semibold" : MUTED}`}>
                      <Tag size={12} /> {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setParams({ minPrice: String(f.get("min") || "") || null, maxPrice: String(f.get("max") || "") || null }); }}>
        <Title icon={Wallet}>Price range</Title>
        <div className="flex items-center gap-2">
          {(["min", "max"] as const).map((n) => (
            <Fragment key={n}>
              {n === "max" && <span className={MUTED}>–</span>}
              <div className="relative w-full">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold ${MUTED}`}>PKR</span>
                <input name={n} type="number" inputMode="numeric" min={0} defaultValue={n === "min" ? minPrice : maxPrice} placeholder={n === "min" ? "Min" : "Max"} className={`${FIELD} py-2.5 text-sm pl-11 pr-2`} />
              </div>
            </Fragment>
          ))}
        </div>
        <button type="submit" className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--gold)] text-[var(--gold)] text-sm font-semibold cursor-pointer">Apply price <ArrowRight size={14} /></button>
      </form>
      <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 cursor-pointer">
        <span className="flex items-center gap-2.5 text-sm font-semibold"><Sparkles size={16} className="text-[var(--gold)]" /> New arrivals only</span>
        <input type="checkbox" className="h-5 w-5 accent-[var(--gold)]" checked={newArrival} onChange={(e) => setParams({ newArrival: e.target.checked ? "true" : null })} />
      </label>
    </div>
  );

  const sortSelect = (extra: string) => (
    <div className={`relative ${extra}`}>
      <ArrowUpDown size={14} className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${MUTED}`} />
      <select aria-label="Sort products" value={sortKey} onChange={(e) => setParams({ sort: e.target.value === "0" ? null : e.target.value })} className={`${FIELD} appearance-none rounded-full py-2 text-[13px] pl-9 pr-8 font-medium cursor-pointer`}>
        {SORTS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
      </select>
      <ChevronDown size={14} className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${MUTED}`} />
    </div>
  );

  return (
    <main className="page-container py-4 lg:py-6 text-[var(--color-foreground)] font-sans antialiased">
      <Breadcrumb items={[{ label: "Home", link: "/" }, { label: heading }]} />
      
      <header className="lg:hidden mt-4 flex items-center gap-3">
        <span className={`${GOLD_ICON} h-11 w-11 shrink-0 rounded-2xl border border-[var(--gold)]/20`}>{q ? <Search size={20} /> : <ShoppingBag size={20} />}</span>
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-[22px] leading-[1.15] font-bold tracking-tight">{q ? `“${q}”` : heading}</h1>
          <p className={`mt-1 flex items-center gap-1.5 text-[13px] ${MUTED}`}><LayoutGrid size={13} className="text-[var(--gold)]" />{countText}{subCategory ? ` in ${subCategory}` : ""}</p>
        </div>
      </header>

      <Scroller className="lg:hidden mt-3 pb-1">
        <Chip icon={Layers} on={!category} onClick={() => setParams({ category: null, subCategory: null })}>All</Chip>
        {categories.map((c: any) => (<Chip key={c._id} icon={category === c._id ? Check : undefined} on={category === c._id} onClick={() => setParams({ category: c._id, subCategory: null })}>{c.categoryname}</Chip>))}
      </Scroller>

      {activeCategory?.subCategories?.length > 0 && (
        <Scroller className="lg:hidden mt-2 pb-1">
          {activeCategory.subCategories.map((sub: string) => (<Chip key={sub} small icon={Tag} on={subCategory === sub} onClick={() => setParams({ subCategory: subCategory === sub ? null : sub })}>{sub}</Chip>))}
        </Scroller>
      )}

      <div className="lg:hidden sticky top-0 z-30 -mx-4 mt-3 px-4 py-2 bg-[var(--color-background)]/85 backdrop-blur-md border-b border-[var(--color-border)] flex items-center gap-2">
        <button onClick={() => setSheetOpen(true)} className={`${GOLD_BTN} px-3.5 py-2 text-[13px]`}>
          <SlidersHorizontal size={14} /> Filters {activeCount > 0 && <span className="grid place-items-center h-[18px] min-w-[18px] px-1 rounded-full bg-[var(--on-gold)] text-[var(--gold)] text-[10px]">{activeCount}</span>}
        </button>
        {sortSelect("flex-1")}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-4 lg:mt-2">
        <aside className="hidden lg:block lg:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-extrabold tracking-tight text-lg"><SlidersHorizontal size={18} className="text-[var(--gold)]" /> Filters</h2>
            {hasFilters && <button onClick={clearAll} className={`${CLEAR_BTN} flex items-center gap-1`}><X size={12} /> Clear</button>}
          </div>
          {filters}
        </aside>

        <section className="flex-1 min-w-0">
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{q ? `Results for "${q}"` : heading}{subCategory ? ` / ${subCategory}` : ""}</h1>
              <p className={`text-sm mt-1 ${MUTED}`}>{countText}</p>
            </div>
            {sortSelect("w-56")}
          </div>

          <h2 className="sr-only">Products</h2>
          {isLoadingSearch ? (
            <div className={GRID}>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}</div>
          ) : products.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <span className={`${GOLD_ICON} h-16 w-16 rounded-full`}><SearchX size={26} /></span>
              <p className="mt-4 font-semibold">No products found</p>
              <p className={`mt-1 text-sm ${MUTED}`}>Try changing or removing some filters.</p>
              {hasFilters && <button onClick={clearAll} className={`${GOLD_BTN} mt-5 px-5 py-2.5 text-sm`}><X size={14} /> Clear filters</button>}
            </div>
          ) : (
            <div className={GRID}>{products.map((p: any, i: number) => <ProductCard key={p._id} product={p} priority={i < 2} />)}</div>
          )}
        </section>
      </div>

      {sheetOpen && (
        <div data-scroll-lock className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
          <button aria-label="Close filters" onClick={() => setSheetOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] flex flex-col rounded-t-[28px] bg-[var(--color-background)] border-t border-[var(--gold)]/30 shadow-2xl">
            <span className="mx-auto mt-3 mb-2 h-1.5 w-11 rounded-full bg-[var(--color-border)]" />
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="flex items-center gap-2 font-extrabold tracking-tight text-xl"><SlidersHorizontal size={18} className="text-[var(--gold)]" /> Filters</h2>
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="grid place-items-center h-9 w-9 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">{filters}</div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--color-border)] pb-[max(1rem,env(safe-area-inset-bottom))]">
              {hasFilters && <button onClick={clearAll} className={`${CLEAR_BTN} text-sm px-2`}>Clear all</button>}
              <button onClick={() => setSheetOpen(false)} className={`${GOLD_BTN} flex-1 py-3.5 text-sm`}>Show {countText} <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}