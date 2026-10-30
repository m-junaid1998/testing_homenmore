import Image from "next/image";
import { Gem, PackageCheck, Search, ShoppingBag, Sparkles, Truck, Wallet } from "lucide-react";
import { whatsappLink } from "@/components/InfoPage";
import { discountPercent, formatRs } from "@/utils/shipping";
import { getShippingRules } from "@/server/ssr";

const GOLD = "var(--color-accent)";
const GREEN = "var(--greeer, #116149)";
const mix = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;
const outline = { WebkitTextStroke: `1px ${GOLD}`, color: "transparent" } as const;



const VALUES = [
  { title: "Design first", text: "Every piece is picked for its look, finish, and overall feel." },
  { title: "Honest prices", text: "Fair, clear pricing with transparent comparison side by side." },
  { title: "Effortless ordering", text: "Guest checkout, wishlist, and direct WhatsApp support anytime." },
];

const JOURNEY = [
  { icon: Search, title: "Browse & choose", text: "Pick your piece, size and colour, and save favourites." },
  { icon: ShoppingBag, title: "Quick checkout", text: "Order as guest or account holder. COD or Online." },
  { icon: PackageCheck, title: "We deliver", text: "We confirm, package carefully, and ship to your door." },
];

export default async function AboutUs() {
  const rules = await getShippingRules();
  const DISCOUNT_PERCENT = discountPercent(rules);
  const CHIPS = ["Delivery across Pakistan", "Cash on Delivery", `${DISCOUNT_PERCENT}% off online payment`];
  return (
    <main className="font-sans text-[var(--color-foreground)] bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] py-14 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(50% 60% at 80% 30%, ${mix(GOLD, 15)}, transparent), radial-gradient(40% 50% at 10% 90%, ${mix(GREEN, 40)}, transparent)`,
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              <span className="h-px w-8 bg-[var(--color-accent)]" />
              Bambotia · Pakistani jewellery
            </p>
            <h1 className="  text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              Made to be worn.
              <span className="block italic text-[var(--color-accent)]">Meant to be remembered.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--color-muted-foreground)]">
              Bambotia is built around elegant, handcrafted designs that feel special every day, not just on special occasions.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <li key={chip} className="rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-card)]/50 px-3 py-1.5 text-[11px] font-medium text-[var(--color-muted-foreground)] backdrop-blur-md">
                  {chip}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Rings Visual */}
          <div className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[380px]" aria-hidden="true">
            {[0, 10, 20, 30].map((inset, i) => (
              <div
                key={inset}
                className="absolute rounded-full border transition-transform duration-700 hover:scale-105"
                style={{
                  inset: `${inset}%`,
                  borderColor: mix(GOLD, 45 - i * 10),
                  background: i === 3 ? `radial-gradient(circle, ${mix(GOLD, 25)}, transparent 70%)` : undefined,
                }}
              />
            ))}
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-background)] shadow-[0_0_50px_-10px_var(--color-accent)]">
                <Gem size={30} strokeWidth={1.25} className="text-[var(--color-accent)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <Sparkles className="mx-auto mb-3 text-[var(--color-accent)]" size={22} />
        <p className="  text-xl sm:text-3xl leading-relaxed">
          “Beautiful jewellery should be <span className="italic text-[var(--color-accent)]">easy to find</span>, <span className="italic text-[var(--color-accent)]">honestly priced</span>, and a pleasure to buy.”
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">
          The idea behind Bambotia
        </p>
      </section>

      {/* Core Values */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-card)]/20">
        <div className="mx-auto grid max-w-6xl divide-y divide-[var(--color-border)] px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {VALUES.map((val, i) => (
            <div key={val.title} className="py-8 md:p-8 md:first:pl-0 md:last:pr-0">
              <span className="  text-5xl sm:text-6xl font-bold leading-none" style={outline}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3   text-xl font-bold">{val.title}</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">{val.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promise Bento Section */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 text-center   text-2xl sm:text-3xl font-bold">Our promise to you</h2>
        <div className="grid gap-3.5 md:grid-cols-3">
          {/* Main Delivery Card (Icon + Title Side-by-side on Mobile) */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent)]/15 via-[var(--color-card)] to-[var(--color-card)] p-6 sm:p-8 flex flex-col justify-between shadow-lg md:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 backdrop-blur-md">
                <Truck size={22} />
              </div>
              <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                Pakistan Wide
              </span>
            </div>
            <div className="mt-6 sm:mt-8">
              <p className="  text-3xl sm:text-5xl font-bold">PKR {rules.deliveryCharge}</p>
              <p className="mt-1 text-sm sm:text-lg font-semibold text-[var(--color-accent)]">Delivered across Pakistan</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Free on orders of PKR {formatRs(rules.freeShippingAbove)} or more.</p>
            </div>
          </div>

          {/* Payment Options Stack */}
          <div className="grid gap-3.5">
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex items-center gap-4 transition-all hover:border-[var(--color-accent)]/40">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                <Wallet size={20} />
              </div>
              <div>
                <p className="  text-xl sm:text-2xl font-bold text-[var(--color-accent)]">{DISCOUNT_PERCENT}% OFF</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Bank Transfer / Easypaisa</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex items-center gap-4 transition-all hover:border-[var(--color-accent)]/40">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                <Wallet size={20} />
              </div>
              <div>
                <p className="  text-lg font-bold">Cash on Delivery</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Pay when it arrives</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Banner */}
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group md:col-span-3 flex items-center justify-between rounded-3xl border border-[#25D366]/30 bg-[#25D366]/10 p-5 sm:p-6 transition-all hover:border-[#25D366] hover:bg-[#25D366]/15"
          >
            <div className="pr-2">
              <p className="  text-lg sm:text-xl font-bold text-[var(--color-foreground)]">Real people, on WhatsApp</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Questions about a piece or an order? Message us anytime.</p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-black transition-transform group-hover:scale-110">
              <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
            </div>
          </a>
        </div>
      </section>

      {/* Customer Journey - Side by Side Icon + Text on Mobile */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-card)]/30 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center   text-2xl sm:text-3xl font-bold">From our hands to yours</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {JOURNEY.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-card)]/40 p-4 sm:p-0 sm:border-none sm:bg-transparent md:flex-col md:items-center md:text-center">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-accent)] shadow-sm">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">Step {i + 1}</span>
                  <h3 className="  text-base sm:text-lg font-bold">{title}</h3>
                  <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)] leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}