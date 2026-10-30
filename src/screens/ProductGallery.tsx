"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import cloudinaryLoader from "../lib/cloudinaryLoader";

/** Swipeable photo strip (CSS scroll-snap) with thumbnails. No state: a thumbnail just scrolls the strip. */
export function ProductGallery({ images, name, action }: { images: string[]; name: string; action?: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const goTo = (index: number) => rail.current?.scrollTo({ left: index * rail.current.clientWidth, behavior: "smooth" });

  return (
    <div className="space-y-3">
      <div className="relative">
        <div ref={rail} className="flex aspect-square snap-x snap-mandatory overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] no-scrollbar">
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center snap-always">
              <Image loader={cloudinaryLoader} src={src} alt={`${name} ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" priority={i === 0} className="object-cover" />
            </div>
          ))}
        </div>
        {/* sits on top of the photo, e.g. the wishlist heart */}
        {action && <div className="absolute right-3 top-3 z-10">{action}</div>}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => goTo(i)} aria-label={`Show image ${i + 1}`} className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[var(--color-border)] transition-colors hover:border-[var(--gold)] md:h-20 md:w-20">
              <Image loader={cloudinaryLoader} src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
