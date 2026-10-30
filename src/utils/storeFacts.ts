import { discountPercent, formatRs, type ShippingRules } from "./shipping";

/** Facts that are true for the whole shop (from the admin delivery settings), reused in SEO copy and FAQ schema. */
export const storeFaqs = (rules: ShippingRules, place = "Pakistan") => [
  {
    q: `Do you deliver jewellery to ${place}?`,
    a: `Yes. Bambotia delivers across Pakistan${place !== "Pakistan" ? `, including ${place}` : ""}. Delivery costs Rs. ${rules.deliveryCharge}, and orders above Rs. ${formatRs(rules.freeShippingAbove)} ship free.`,
  },
  { q: "Can I pay cash on delivery?", a: "Yes. You can choose cash on delivery, or pay online by bank transfer or Easypaisa." },
  { q: "Is there a discount for paying online?", a: `Yes. Orders paid online get ${discountPercent(rules)}% off the order subtotal.` },
  { q: "Do I need an account to order?", a: "No. Guest checkout is available, so you can order without creating an account." },
];
