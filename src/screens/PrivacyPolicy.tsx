import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Database, KeyRound, Lock, Share2, Trash2, UserCheck } from "lucide-react";
import { PageHero, STORE, whatsappLink } from "@/components/InfoPage";

// Privacy page = "trust" design: green accents, an at-a-glance row, then short collapsible answers.
const GREEN = "color-mix(in oklab, var(--greeer, #116149) 55%, transparent)";

const GLANCE = [
  { icon: Lock, title: "No card details", text: "We never ask for or store your card number." },
  { icon: Share2, title: "Never sold", text: "Your data is shared only to deliver your order." },
  { icon: KeyRound, title: "Safe passwords", text: "Passwords are stored hashed, never as plain text." },
  { icon: Trash2, title: "Yours to delete", text: "Ask us and we will remove your account data." },
];

const ITEMS: { icon: typeof Lock; title: string; body: ReactNode }[] = [
  {
    icon: Database,
    title: "What we collect",
    body: (
      <ul className="list-disc space-y-1.5 pl-5 marker:text-[var(--color-accent)]">
        <li><b className="text-[var(--color-foreground)]">Orders:</b> name, phone, delivery address and any notes you add.</li>
        <li><b className="text-[var(--color-foreground)]">Account:</b> name, email and password, if you create an account.</li>
        <li><b className="text-[var(--color-foreground)]">Reviews and messages:</b> what you post or send us through the contact form or WhatsApp.</li>
        <li><b className="text-[var(--color-foreground)]">Cart and wishlist:</b> saved to your account, or to an anonymous guest ID if you shop without one.</li>
      </ul>
    ),
  },
  {
    icon: UserCheck,
    title: "How we use it",
    body: <p>To confirm, pack and deliver your orders, contact you about them by phone or WhatsApp, keep your cart and history ready, answer your questions, and keep the store safe from fraud.</p>,
  },
  {
    icon: Share2,
    title: "Who sees it",
    body: <p>Only the people who help us serve you: delivery couriers (name, phone, address), and the services that run our website, such as image hosting, email and Google sign-in if you use it. We may also share data if the law requires it.</p>,
  },
  {
    icon: Lock,
    title: "Storage & security",
    body: <p>Connections are encrypted and passwords are hashed. Your browser keeps a small login session or guest ID so your cart and wishlist stay put; we do not use it for advertising. We keep order records only as long as needed for delivery, returns and accounting.</p>,
  },
  {
    icon: Trash2,
    title: "Your choices",
    body: <p>You can ask to see, correct or delete your information, or close your account, at any time. Completed orders may have to be kept for accounting reasons. Our store is meant for adults, so we do not knowingly collect children&apos;s data.</p>,
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="text-[var(--color-foreground)]">
      <PageHero
        icon={<Lock size={14} />}
        eyebrow="Your privacy"
        title="Privacy Policy"
        subtitle="The short version: we only keep what we need to deliver your order, and we never sell it."
      />

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
        <section aria-label="At a glance" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GLANCE.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border p-4 text-center" style={{ borderColor: GREEN, background: `linear-gradient(180deg, ${GREEN}, transparent)` }}>
              <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-[var(--color-background)]/60 text-[var(--color-accent)]"><Icon size={20} /></div>
              <h2 className="text-sm font-bold">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{text}</p>
            </div>
          ))}
        </section>

        <section aria-label="Details" className="space-y-3">
          {ITEMS.map(({ icon: Icon, title, body }, i) => (
            <details key={title} open={i === 0} className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] open:border-[var(--color-accent)]/40">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--color-accent)]" style={{ background: GREEN }}><Icon size={18} /></span>
                <h3 className="flex-1 font-display text-lg font-bold">{title}</h3>
                <ChevronDown size={18} className="shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-5 text-sm leading-relaxed text-[var(--color-muted-foreground)] sm:px-5 sm:pl-[4.75rem]">{body}</div>
            </details>
          ))}
        </section>

        <section className="flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 text-center sm:flex-row sm:text-left" style={{ borderColor: GREEN }}>
          <div>
            <p className="font-bold">Questions about your data?</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">Message us on WhatsApp ({STORE.phone}) or use the contact form. We may update this policy; the date below shows the latest version.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href={whatsappLink("Hi Bambotia, I have a question about my data.")} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-foreground)] transition hover:brightness-110">WhatsApp</a>
            <Link href="/contact" className="rounded-xl border border-[var(--color-border)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">Contact</Link>
          </div>
        </section>

        <p className="text-center text-xs text-[var(--color-muted-foreground)]">Last updated: {STORE.updated}</p>
      </div>
    </main>
  );
}