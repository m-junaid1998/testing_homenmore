"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Info } from "lucide-react";
import { PageHero, whatsappLink } from "@/components/InfoPage";
import { discountPercent, formatRs, type ShippingRules } from "@/utils/shipping";
import { useShippingRules } from "@/hooks/useShipping";

type Faq = { cat: string; q: string; a: string };

const buildFaqs = (rules: ShippingRules): Faq[] => [
  { cat: "Orders", q: "How do I place an order?", a: "Browse the shop, choose your size/colour, add to cart, and checkout with your details." },
  { cat: "Orders", q: "Do I need an account to order?", a: "No. You can check out as a guest. Accounts simply save your details for future orders." },
  { cat: "Orders", q: "Can I order through WhatsApp?", a: "Yes. On checkout, tap “Order via WhatsApp” to send your cart as a ready message." },
  { cat: "Orders", q: "How can I track my order?", a: "Open “My Orders” to view status. Guest orders save to your current browser session." },
  { cat: "Orders", q: "Can I change or cancel my order?", a: "Message us on WhatsApp with your order number as soon as possible before shipment." },
  { cat: "Payment", q: "Which payment methods do you accept?", a: "Cash on Delivery, Bank Transfer, and Easypaisa. Payment details appear at checkout." },
  { cat: "Payment", q: "Is there an online payment discount?", a: `Yes, get ${discountPercent(rules)}% off your subtotal when paying via Bank Transfer or Easypaisa.` },
  { cat: "Payment", q: "I paid online. What happens next?", a: "Send the payment screenshot on WhatsApp so we can verify and process your order." },
  { cat: "Delivery", q: "How much is delivery?", a: `Delivery is PKR ${rules.deliveryCharge}, and free on orders of PKR ${formatRs(rules.freeShippingAbove)} or more.` },
  { cat: "Delivery", q: "Do you deliver across Pakistan?", a: "Yes, we ship nationwide across Pakistan." },
  { cat: "Delivery", q: "How long will delivery take?", a: "We confirm estimated delivery timelines via phone/WhatsApp after order placement." },
  { cat: "Returns", q: "My item arrived damaged or wrong. What to do?", a: "Contact WhatsApp support with photos and order number for immediate replacement." },
  { cat: "Returns", q: "Can I return or exchange a piece?", a: "Contact us; unused items in original condition are evaluated case-by-case." },
  { cat: "Jewellery care", q: "How do I keep my jewellery looking new?", a: "Keep dry, avoid direct perfume spray, remove before water exposure, wipe with soft cloth." },
  { cat: "Jewellery care", q: "How should I store it?", a: "Store separately in a dry pouch/box away from direct heat and air moisture." },
];


export default function FaqPage() {
  const rules = useShippingRules();
  const FAQS = useMemo(() => buildFaqs(rules), [rules]);
  const CATEGORIES = useMemo(() => ["All", ...Array.from(new Set(FAQS.map((f) => f.cat)))], [FAQS]);
  const [cat, setCat] = useState("All");
  const [openQ, setOpenQ] = useState<string | null>(FAQS[0].q);
  const visible = useMemo(() => FAQS.filter((f) => cat === "All" || f.cat === cat), [cat, FAQS]);

  return (
    <main className="text-[var(--color-foreground)] font-sans bg-[var(--color-background)]">
      <PageHero icon={<Info size={14} />} eyebrow="Help centre" title="Frequently asked questions" subtitle="Quick answers about ordering, payment, delivery, and jewellery care." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-colors ${cat === c ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-accent)]"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {visible.map((f) => (
            <div key={f.q} className={`rounded-2xl border transition-all ${openQ === f.q ? "border-[var(--color-accent)]/50 bg-[var(--color-card)]" : "border-[var(--color-border)] hover:border-[var(--color-accent)]/30"}`}>
              <button type="button" onClick={() => setOpenQ(openQ === f.q ? null : f.q)} aria-expanded={openQ === f.q} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                <span className="font-medium text-sm sm:text-base">{f.q}</span>
                <ChevronDown size={18} className={`shrink-0 text-[var(--color-accent)] transition-transform duration-200 ${openQ === f.q ? "rotate-180" : ""}`} />
              </button>
              {openQ === f.q && <p className="px-4 pb-4 text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Message us anytime and our team will get back to you.</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-black text-xs font-semibold hover:brightness-105 transition">
            <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} className="shrink-0" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}