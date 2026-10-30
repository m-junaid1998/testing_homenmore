"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaList } from "@/hooks/useMedia";
import { QA } from "@/api/queryArgs";
import cloudinaryLoader from "@/lib/cloudinaryLoader";

type Slide = {  id: string;  image: string;  link: string };

export default function HeroSection() {
  const { mediaList } = useMediaList(QA.carousel);
  const [current, setCurrent] = useState(0);

  const slides: Slide[] = mediaList.filter((m: any) => m?._id && m?.mediaUrl).map((m: any) => ({
   id: String(m._id), image: m.mediaUrl, link: "/shop" }));

  const activeIndex = slides.length ? current % slides.length : 0;

  const move = useCallback(
    (step: number) => { setCurrent((prev) => slides.length ? (prev + step + slides.length) % slides.length : 0);
    },
    [slides.length]
  );

  return (
    <section aria-label="Hero Carousel" className="page-container py-4 sm:py-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
        {slides.length === 0 ? (
          <div className="absolute inset-0 animate-pulse bg-[var(--color-card)]" />
        ) : (
          slides.map((slide, index) => (
            <Link
              key={slide.id}
              href={slide.link}
              tabIndex={index === activeIndex ? 0 : -1}
              aria-hidden={index !== activeIndex}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === activeIndex
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
            >
              <Image
                loader={cloudinaryLoader}
                src={slide.image}
                alt={index === 0 ? "Bambotia bridal and artificial jewellery collection Pakistan" : `Bambotia jewellery offer banner ${index + 1}`}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1440px"
                className="object-cover object-center"
              />
            </Link>
          ))
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white sm:flex"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white sm:flex"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-7 bg-[var(--color-gold)]"
                      : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}