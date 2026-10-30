import { Banknote, BadgePercent,  Truck, BadgeCheck } from "lucide-react";
import { discountPercent, formatRs, type ShippingRules } from "@/utils/shipping";

// Four short promises, all taken from how checkout really works. Server component.
export function TrustRow({ rules }: { rules: ShippingRules }) {
  const items = [
    { Icon: Truck, title: "Delivery across Pakistan", text: `Rs. ${rules.deliveryCharge}, free above Rs. ${formatRs(rules.freeShippingAbove)}` },
    { Icon: Banknote, title: "Cash on delivery", text: "Pay when your order arrives" },
    { Icon: BadgePercent, title: `${discountPercent(rules)}% off online`, text: "Bank transfer or Easypaisa" },
    { Icon: BadgeCheck, title: "Authentic Quality", text: "Quality you can trust 100%" },
  ];

  return (
    <section aria-label="Why shop with us" className="border-b border-[var(--color-border)]">
      <ul className="page-container grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:grid-cols-4">
        {items.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--gold-soft)] text-[var(--gold)]">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-sans)] text-[13px] font-bold leading-tight">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-[var(--color-muted-foreground)]">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
