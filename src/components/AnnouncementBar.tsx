
"use client";

import { useState } from "react";
import { CloseIcon, SparklesIcon, TruckIcon } from "@/utils/socialicons";
import { discountPercent, formatRs, type ShippingRules } from "@/utils/shipping";

const COPIES = 6;

const CSS = `
@keyframes announcement-marquee {
  to { transform: translateX(-16.666667%); }
}
.announcement-marquee { animation: announcement-marquee 26s linear infinite; }
.announcement-marquee-wrap:hover .announcement-marquee,
.announcement-marquee-wrap:focus-within .announcement-marquee { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .announcement-marquee { animation: none; } }
`;

export function AnnouncementBar({ rules }: { rules: ShippingRules }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const offers = [
    { text: `Free delivery across Pakistan on orders above Rs. ${formatRs(rules.freeShippingAbove)}`, Icon: TruckIcon },
    { text: `${discountPercent(rules)}% off when you pay online`, Icon: SparklesIcon },
  ];

  return (
    <div role="region" aria-label="Store announcements" className="relative z-40 flex items-center overflow-hidden border-b border-[var(--gold)]/30 bg-[var(--bar)] py-2 text-[11px] font-semibold tracking-wide text-[var(--primary-foreground)] dark:text-[var(--gold-fill)] sm:text-xs">
      <style>{CSS}</style>
      <div className="announcement-marquee-wrap min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="announcement-marquee flex w-max whitespace-nowrap">
          {Array.from({ length: COPIES }, (_, n) => (
            <div key={n} aria-hidden={n > 0} className="flex shrink-0">
              {offers.map(({ text, Icon }) => (
                <div key={text} className="flex shrink-0 items-center gap-2 px-4 sm:px-6">
                  <Icon size={16} className="shrink-0 text-[var(--gold-fill)]" />
                  <span>{text}</span>
                  <span className="ml-5 size-1.5 shrink-0 rotate-45 bg-[var(--gold-fill)]/80 sm:ml-8" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setVisible(false)} aria-label="Close announcements" className="mx-2 shrink-0 rounded-full bg-[var(--gold)]/10 p-1.5 text-[var(--primary-foreground)] hover:bg-[var(--gold)]/25">
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

export default AnnouncementBar;
