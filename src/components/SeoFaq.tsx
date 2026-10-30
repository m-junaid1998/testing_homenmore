import { JsonLd } from "./JsonLd";

export type Faq = { q: string; a: string };

/** Visible FAQ + matching FAQPage schema. Only put answers here that are true for the shop. */
export function SeoFaq({ title, faqs }: { title: string; faqs: Faq[] }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
      <div className="mt-4 divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        {faqs.map((f) => (
          <details key={f.q} className="group p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold sm:text-base">{f.q}</summary>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted-foreground)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
