import Image from "next/image";

/** Full-screen brand loader. Server component: it is in the first HTML, so visitors see it before any JavaScript has loaded. */
export function PageLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`fixed inset-0 z-[100] flex select-none flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-light)] text-[var(--color-text-dark)] ${className}`}>
      {/* ambient rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[300px] w-[300px] animate-ping rounded-full border border-[var(--color-accent)]/10 [animation-duration:3s]" />
        <div className="absolute h-[450px] w-[450px] animate-pulse rounded-full border border-[var(--color-accent)]/5 [animation-duration:4s]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl border border-[var(--color-accent)]/30 bg-[var(--color-card-bg)] p-4 shadow-2xl ring-1 ring-[var(--color-accent)]/20">
          <Image src="/logo.avif" alt="Bambotia Logo" width={80} height={80} priority className="animate-pulse object-contain [animation-duration:2s]" />
        </div>

        {/* not a heading: every page already has its own h1 */}
        <p className="animate-gold-shimmer mb-2 pl-[0.25em] font-serif text-3xl font-bold uppercase tracking-[0.25em] md:text-5xl">Bambotia</p>
        <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">Luxury &amp; Excellence</p>
        <div className="mb-6 h-px w-16 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

        <div className="flex items-center space-x-3" role="status" aria-label="Loading">
          {[0, 0.2, 0.4].map((delay) => (
            <span key={delay} className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-accent)] [animation-duration:1s]" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
