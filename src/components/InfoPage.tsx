import type { ReactNode } from "react";

export const STORE = {
  name: "Bambotia",
  phone: "+923433083783",
  whatsapp: "923433083783", // same number as the floating WhatsApp button
  updated: "October 2026",
};
export const whatsappLink = (text = `Hi ${STORE.name}, I have an inquiry.`) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;

// Shared hero: soft gold glow, eyebrow pill, serif title.
export const PageHero = ({ icon, eyebrow, title, subtitle }: { icon: ReactNode; eyebrow: string; title: string; subtitle: string }) => (
  <section className="relative overflow-hidden border-b border-[var(--color-border)]">
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(60% 90% at 50% 0%, color-mix(in oklab, var(--color-accent) 20%, transparent), transparent)" }}
    />
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[11px] font-bold uppercase tracking-[0.2em]">
        {icon}
        {eyebrow}
      </span>
      <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-foreground)]">{title}</h1>
      <p className="mt-4 text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
    </div>
  </section>
);

export const P = ({ children }: { children: ReactNode }) => <p>{children}</p>;
export const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-[var(--color-accent)]">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

export type LegalSection = { id: string; title: string; content: ReactNode };

// Privacy / Terms layout: hero, sticky table of contents (desktop), numbered sections.
export const LegalLayout = ({
  icon, eyebrow, title, subtitle, sections,
}: { icon: ReactNode; eyebrow: string; title: string; subtitle: string; sections: LegalSection[] }) => (
  <main className="text-[var(--color-foreground)] font-sans">
    <PageHero icon={icon} eyebrow={eyebrow} title={title} subtitle={subtitle} />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[240px_1fr] gap-10">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-1 text-sm" aria-label="Table of contents">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">On this page</p>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="flex gap-2.5 py-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors">
              <span className="text-[var(--color-accent)]/70 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.title}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="space-y-5 min-w-0">
        <p className="text-xs text-[var(--color-muted-foreground)]">Last updated: {STORE.updated}</p>
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 font-display text-xl font-bold mb-3">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center">{i + 1}</span>
              {s.title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">{s.content}</div>
          </section>
        ))}
      </div>
    </div>
  </main>
);
