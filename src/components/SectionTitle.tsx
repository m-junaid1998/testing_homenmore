import Link from "next/link";
import { Flame, Star, ArrowRight, Sparkles } from "lucide-react";

export function SectionTitle({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  const name = title.toLowerCase();
  const isBest = name === "best sellers";
  const isTop = name === "top rated";
  const isNew = name === "new arrivals";
  const Icon = isBest ? Flame : isTop ? Star : Sparkles;
  const featured = isBest || isTop || isNew;


  return (
    <div className={`mb-3 sm:mb-5 ${featured ? "flex items-center justify-between gap-3" : "text-center"}`}>
      <div className={`flex items-center gap-3 ${featured ? "" : "flex-col"}`}>
        {featured && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-card)] text-[var(--color-primary)]">
            <Icon size={21} />
          </div>
        )}
        <div>
          <h2 className={`font-semibold  ${featured ? "text-base font-extrabold uppercase sm:text-xl" : "text-xl sm:text-2xl"}`}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className={featured
          ? "inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-bold uppercase text-[var(--color-primary)]"
          : "mt-3 inline-block text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-[var(--color-primary)]"
        }>
          View all {featured && <ArrowRight size={14} />}
        </Link>
      )}
    </div>
  );
}

export const SECTION = "page-container py-10 sm:py-14";
export const PRODUCT_GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4";