// Delivery rules. The shop owner changes them in Admin > Settings (stored in the database);
// the values below are only the defaults used before anything has been saved.
// The BACKEND prices every order with the saved rules; the storefront only displays them.
export interface ShippingRules {
  deliveryCharge: number; // PKR
  freeShippingAbove: number; // PKR: orders from this subtotal ship free
  onlinePaymentDiscount: number; // 0.05 = 5% off the subtotal when paying online
}

export const DEFAULT_SHIPPING_RULES: ShippingRules = { deliveryCharge: 250, freeShippingAbove: 10000, onlinePaymentDiscount: 0.05 };

export const ORDER_WHATSAPP = "923433083783";

export const PAYMENT_METHODS = ["Cash on Delivery", "Online Payment"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// An empty cart costs nothing; from the free-delivery amount upwards delivery is free.
export const deliveryFor = (subtotal: number, rules: ShippingRules) => (subtotal <= 0 || subtotal >= rules.freeShippingAbove ? 0 : rules.deliveryCharge);

/** Everything the shopper pays for a given items subtotal. */
export const orderTotals = (subtotal: number, method: PaymentMethod, rules: ShippingRules) => {
  const shippingPrice = deliveryFor(subtotal, rules);
  const discountPrice = method === "Online Payment" ? Math.round(subtotal * rules.onlinePaymentDiscount) : 0;
  return { itemsPrice: subtotal, shippingPrice, discountPrice, totalPrice: subtotal + shippingPrice - discountPrice };
};

export const discountPercent = (rules: ShippingRules) => Math.round(rules.onlinePaymentDiscount * 100);
export const formatRs = (n: number) => n.toLocaleString("en-PK");
