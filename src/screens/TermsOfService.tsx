import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Scale } from "lucide-react";
import { PageHero, STORE, whatsappLink } from "@/components/InfoPage";
import { discountPercent, formatRs, type ShippingRules } from "@/utils/shipping";
import { getShippingRules } from "@/server/ssr";

const buildFacts = (rules: ShippingRules) => [
  { value: `PKR ${rules.deliveryCharge}`, label: "Delivery across Pakistan" },
  { value: "FREE", label: `On orders of PKR ${formatRs(rules.freeShippingAbove)}+` },
  { value: `${discountPercent(rules)}% OFF`, label: "Bank Transfer / Easypaisa" },
];

const buildClauses = (rules: ShippingRules): { title: string; text: ReactNode }[] => {
  const DISCOUNT = discountPercent(rules);
  return [
  { title: "Orders", text: "Placing an order is an offer to buy. You can order as a guest or with an account. We may contact you to confirm, and reserve the right to cancel if stock or details cannot be verified." },
  { title: "Prices & stock", text: "All prices are in PKR. Stock is limited and reserved once confirmed. In case of price/stock errors, we will contact you and issue a refund if paid." },
  { title: "Payment", text: `Pay via COD, or Bank Transfer / Easypaisa for ${DISCOUNT}% off. Send transaction screenshots on WhatsApp for online payment verification.` },
  { title: "Delivery", text: `Nationwide delivery for PKR ${rules.deliveryCharge}, free over PKR ${formatRs(rules.freeShippingAbove)}. Delivery timelines are estimates.` },
  { title: "Damaged items & returns", text: "For damaged or incorrect items, message us immediately on WhatsApp with clear photos. Returns are reviewed case-by-case." },
  { title: "Products & reviews", text: "Colors may vary slightly across screens. Reviews must be honest; inappropriate content will be removed." },
  { title: "Law & changes", text: "Governed by the laws of Pakistan. Terms may be updated; the active version on this page applies." },
];
};

export default async function TermsOfService() {
  const rules = await getShippingRules();
  const FACTS = buildFacts(rules);
  const CLAUSES = buildClauses(rules);
  return (
    <main className="font-sans text-[var(--color-foreground)] bg-[var(--color-background)]">
      <PageHero icon={<Scale size={14} />} eyebrow="The fine print" title="Terms of Service" subtitle="Simple ground rules for shopping with Bambotia." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[var(--color-accent)]">{f.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)]">{f.label}</p>
            </div>
          ))}
        </section>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <ol className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            {CLAUSES.map((c, i) => (
              <li key={c.title} className="flex gap-4 p-5">
                <span className="text-2xl font-bold text-[var(--color-accent)] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wide">{c.title}</h2>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-muted-foreground)]">{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <h2 className="text-base font-bold">Have questions?</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">Ask us before ordering on WhatsApp at {STORE.phone}.</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-black transition hover:brightness-105">
              <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} /> Chat on WhatsApp
            </a>
            <Link href="/faq" className="block rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-center text-xs font-semibold hover:border-[var(--color-accent)]">Read the FAQ</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}