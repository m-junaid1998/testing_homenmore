"use client";

import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Sparkles, AlertCircle, Copy, Check, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { FormInput } from "../components/FormInput";
import { Button } from "../components/Button";
import { Breadcrumb } from "../components/Breadcrumb";
import { toast } from "../utils/toast";
import { WhatsAppIcon } from "../utils/socialicons";
import { useOrder } from "../hooks/useOrder";
import { useCart } from "../hooks/useCart";
import { validateEmptyObject } from "../utils/helper";
import { formatRs, orderTotals } from "../utils/shipping";
import { useShippingRules } from "../hooks/useShipping";
import Image from "next/image";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full Name required"),
  phone: z
    .string()
    .regex(/^((\+92)|(0092)|(0))?3[0-9]{9}$/, "Valid PK number required"),
  country: z.string().trim().min(2, "Country is required").max(30),
  city: z.string().min(1, "City required"),
  area: z.string().min(1, "Area required"),
  address: z.string().min(5, "Address required"),
  postalCode: z.string().optional(),
  orderNotes: z.string().optional(),
  paymentMethod: z.enum(["Cash on Delivery", "Online Payment"], {
    message: "Payment method is required",
  }),
});
type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { createOrder, isOrderMutationLoading } = useOrder();
  const {
    cartItems: liveCartItems,
    isLoadingCart,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      country: "Pakistan",
      city: "",
      postalCode: "",
      area: "",
      address: "",
      orderNotes: "",
      paymentMethod: "Cash on Delivery",
    },
  });

  const paymentMethod = watch("paymentMethod");

  interface CheckoutItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    img: string;
    stock: number;
    color: string | null;
    size: string;
  }

  const checkoutItems: CheckoutItem[] = liveCartItems.map((item: any) => {
    const p = item.product || {};
    const productColors: string[] = p.colors || [];
    return {
      id: String(p._id ?? ""),
      name: p.name || "Product",
      price: item.price ?? (p.salePrice || p.regularPrice || 0),
      qty: item.qty || 1,
      img: p.images?.[0] || "",
      stock: p.stock ?? Infinity,
      color: item.color || productColors[0] || null,
      size: item.size || "",
    };
  });

  const updateQty = (id: string, delta: number, size = "", color: string | null = null) => {
    const target = checkoutItems.find((i) => i.id === id && i.size === size && i.color === color);
    if (!target) return;
    const newQty = target.qty + delta;
    // Other sizes of the same product share the same stock.
    const otherSizesQty = checkoutItems
      .filter((i) => i.id === id && i.size !== size)
      .reduce((sum, i) => sum + i.qty, 0);
    if (delta > 0 && newQty + otherSizesQty > target.stock) {
      toast.error(
        "Stock Limit Reached",
        `Only ${target.stock} units available in stock.`
      );
      return;
    }
    if (newQty < 1) {
      removeFromCart(id, target.name, { size: size || undefined, color: target.color || undefined });
      return;
    }
    addToCart(id, newQty, true, { size: size || undefined, color: target.color || undefined });
  };

  const rules = useShippingRules();
  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  // Same rules the server applies when it prices the order (utils/shipping.ts), shown here for the shopper.
  const { shippingPrice: deliveryCharge, discountPrice: onlineDiscount, totalPrice: totalAmount } = orderTotals(subtotal, paymentMethod, rules);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success("Copied to clipboard", text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendPaymentProof = () => {
    const msg = `Hi, I want to send payment proof for my order.\nAmount: PKR ${totalAmount.toLocaleString()}\nPayment Method: Online Payment (Bank / Easypaisa)`;
    window.open(`https://wa.me/923318883303?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (checkoutItems.length === 0) {
      return toast.error("Cart is empty", "Please add items first.");
    }
    try {
      const customerInfoPayload = validateEmptyObject({
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        areaTown: data.area,
        address: data.address,
      });
      const payload = {
        customerInfo: {
          ...customerInfoPayload,
          postalCode: data.postalCode || "",
          orderNotes: data.orderNotes?.trim() || "",
        },
        // Only WHAT and HOW MANY: the server takes prices, delivery charge and discount from its own data.
        orderItems: checkoutItems.map((item) => ({ product: item.id, qty: item.qty, color: item.color, size: item.size })),
        paymentMethod: data.paymentMethod,
      };

      const res = await createOrder(payload);

      if (res?.success) {
        await clearCart();
        router.replace(`/orders/${res?.data?.data?.orderNumber}?placed=1`);
      }
    } catch (error: any) {
      if (!error?.message?.startsWith("Please enter")) {
        toast.error(
          "Order Failed",
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong!"
        );
      }
    }
  };

  const handleWhatsApp = () => {
    if (checkoutItems.length === 0)
      return toast.error(
        "Cart is empty",
        "Please add items before sending inquiry."
      );
    const totalUnits = checkoutItems.reduce((acc, item) => acc + item.qty, 0);
    const itemWord =
      checkoutItems.length > 1 || totalUnits > 1 ? "items" : "item";
    const itemsFormatted = checkoutItems
      .map((item, idx) => {
        const itemLink = `${window.location.origin}/product/${item.id}`;
        const qtyWord = item.qty > 1 ? "items" : "item";
        const colorLine = `${item.color ? `\nColor: ${item.color}` : ""}${item.size ? `\nSize: ${item.size}` : ""}`;
        return [
          `*${idx + 1}. ${item.name.toUpperCase()}*`,
          `Quantity: ${item.qty} ${qtyWord}${colorLine}`,
          `Price: Rs. ${item.price.toLocaleString()} x ${item.qty} = *Rs. ${(item.price * item.qty).toLocaleString()}*`,
          `Link: ${itemLink}`,
        ].join("\n");
      })
      .join("\n\n");

    const msg = [
      "*INQUIRY / ORDER DETAILS*",
      "-------------------------------",
      `*ITEMS ORDERED (${checkoutItems.length}):*`,
      itemsFormatted,
      "",
      `*Subtotal:* Rs. ${subtotal.toLocaleString()}`,
      `*Shipping:* ${deliveryCharge === 0 ? "FREE" : `Rs. ${deliveryCharge}`}`,
      ...(onlineDiscount > 0 ? [`*Online Discount (10%):* -Rs. ${onlineDiscount.toLocaleString()}`] : []),
      `*Grand Total:* *Rs. ${totalAmount.toLocaleString()}*`,
      "-------------------------------",
      `Hi, I want to place an order for the ${itemWord} listed above. Please share further details.`,
    ].join("\n");

    window.open(
      `https://wa.me/923433083783?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const ReqLabel = ({ text }: { text: string }) => (
    <span>
      {text} <span className="text-red-500 font-bold ml-0.5">*</span>
    </span>
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-text-dark)] page-container py-8 space-y-6 font-sans">
      <Breadcrumb
        items={[{ label: "Home", link: "/" }, { label: "Checkout" }]}
      />
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold tracking-widest text-[var(--color-accent)] uppercase">
          SECURE CHECKOUT
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-display">
          Complete Your Order
        </h1>
        <p className="text-xs text-[var(--color-muted)] flex items-center justify-center gap-1">
          <Lock size={12} /> Your information is safe and used only for delivery
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4"
      >
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <h2 className="text-lg font-bold font-display">
                Customer Information
              </h2>
              <span className="text-[10px] font-bold text-[var(--color-muted)] tracking-widest uppercase">
                STEP 1
              </span>
            </div>
            <FormInput
              label={<ReqLabel text="Full Name" />}
              {...register("fullName")}
              error={errors.fullName?.message}
              placeholder="Enter Full Name"
              className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label={<ReqLabel text="Phone Number" />}
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="Enter Your Phone Number"
                className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
              />
              <FormInput
                label="Country"
                {...register("country")}
                error={errors.country?.message}
                placeholder="Country Name"
                className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormInput
                label={<ReqLabel text="City" />}
                {...register("city")}
                error={errors.city?.message}
                placeholder="Enter City"
                className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
              />
              <FormInput
                label="Postal Code"
                {...register("postalCode")}
                error={errors.postalCode?.message}
                placeholder="Postal Code (Optional)"
                className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
              />
            </div>
            <FormInput
              label={<ReqLabel text="Area / Town" />}
              {...register("area")}
              error={errors.area?.message}
              placeholder="Enter Your Area/Town"
              className="!bg-[var(--color-card-bg)] !border-[var(--color-border)]"
            />
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                <ReqLabel text="Complete Delivery Address" />
              </label>
              <textarea
                {...register("address")}
                rows={3}
                placeholder="House #, Street, Landmark..."
                className="w-full rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
              />
              {errors.address && (
                <p className="flex items-center space-x-1 text-xs text-red-500 font-medium mt-1">
                  <AlertCircle size={13} />
                  <span>{errors.address.message}</span>
                </p>
              )}
            </div>
            <textarea
              {...register("orderNotes")}
              rows={2}
              placeholder="Order Notes (optional)"
              className="w-full rounded-xl bg-[var(--color-card-bg)] border border-[var(--color-border)] p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
            />
          </div>

          {/* STEP 2: Payment Method */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <h2 className="text-lg font-bold font-display">Payment Method</h2>
              <span className="text-[10px] font-bold text-[var(--color-muted)] tracking-widest uppercase">
                STEP 2
              </span>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                onClick={() => setValue("paymentMethod", "Cash on Delivery")}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${paymentMethod === "Cash on Delivery"
                    ? "border-[var(--color-accent)] bg-[var(--gold-soft)] shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"
                  }`}
              >
                <input
                  type="radio"
                  value="Cash on Delivery"
                  {...register("paymentMethod")}
                  className="mt-1 cursor-pointer accent-[var(--color-accent)]"
                />

                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--color-foreground)]">
                    Cash on Delivery (COD)
                  </p>

                  <p className="text-[11px] text-[var(--color-muted)]">
                    Pay in cash when your order arrives at your doorstep.
                  </p>

                  <p className="text-[10px] text-[var(--color-foreground)] font-medium flex items-center gap-1 pt-0.5">
                    <ShieldCheck
                      size={12}
                      className="text-[var(--color-success)]"
                    />
                    100% secure — Inspect before payment
                  </p>
                </div>
              </label>

              {/* Online Payment */}
              <label
                onClick={() => setValue("paymentMethod", "Online Payment")}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${paymentMethod === "Online Payment"
                    ? "border-[var(--color-accent)] bg-[var(--gold-soft)] shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]"
                  }`}
              >
                <input
                  type="radio"
                  value="Online Payment"
                  {...register("paymentMethod")}
                  className="mt-1 cursor-pointer accent-[var(--color-accent)]"
                />

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[var(--color-foreground)]">
                      Online Payment (Bank Transfer / Easypaisa)
                    </p>

                    <span className="text-[10px] font-extrabold text-[var(--color-success)] bg-[var(--gold-soft)] border border-[var(--color-border)] px-2 py-0.5 rounded-md shrink-0">
                      5% OFF
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-muted)]">
                    Get instant 5% discount on paying via Bank Transfer or Easypaisa.
                  </p>
                </div>
              </label>

              {paymentMethod === "Online Payment" && (
                <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-accent)]/40 space-y-4 animate-fadeIn">
                  {/* Easypaisa Account */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                      <Smartphone
                        size={15}
                        className="text-[var(--color-success)]"
                      />

                      <span className="text-xs font-extrabold text-[var(--color-accent)] uppercase tracking-wider">
                        Easypaisa Account
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase">
                          Account Title
                        </p>

                        <p className="font-bold text-[var(--color-foreground)]">
                          MUHAMMAD IRFAN BAMBOO TYA
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase">
                          Easypaisa Mobile No.
                        </p>

                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--color-foreground)] font-mono">
                            0332 3399238
                          </p>

                          <button
                            type="button"
                            onClick={() => handleCopy("03323399238", "easy")}
                            aria-label="Copy Easypaisa number"
                            className="text-[var(--color-muted)] hover:text-[var(--color-accent)] cursor-pointer transition-colors"
                          >
                            {copiedField === "easy" ? (
                              <Check size={12} className="text-[var(--color-success)]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof */}
                  <div className="pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs font-bold text-[var(--color-foreground)] mb-3">
                      Transfer karne ke baad transaction screenshot WhatsApp par send kar dein.
                    </p>

                    <button
                      type="button"
                      onClick={handleSendPaymentProof}
                      className="w-full py-2.5 px-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <Image src="/whatsapp.svg" alt="WhatsApp" width={14} height={14} className="shrink-0" />
                      Send Payment Proof
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* STEP 3: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xs sticky top-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <h2 className="text-lg font-bold font-display">Order Summary</h2>
              <span className="text-[10px] font-bold text-[var(--color-muted)] tracking-widest uppercase">
                STEP 3
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--color-success)] text-[13px] font-medium flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--color-success)] shrink-0" />
              <span>Free delivery on orders over PKR {formatRs(rules.freeShippingAbove)}</span>
            </div>

            <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 max-h-[300px]">
              {isLoadingCart ? (
                <p className="text-xs text-[var(--color-muted)] text-center py-4">
                  Loading items...
                </p>
              ) : checkoutItems.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)] text-center py-4">
                  No items in checkout.
                </p>
              ) : (
                checkoutItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}`}
                    className={`pb-3.5 flex items-center justify-between gap-3 ${index !== checkoutItems.length - 1
                        ? "border-b border-[var(--color-border)]"
                        : ""
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-[var(--color-background)] border border-[var(--color-border)] shrink-0"
                      />
                      <div className="min-w-0">
                        <a href={`/product/${item.id}`} className="block text-xs font-bold text-[var(--color-text-dark)] hover:text-[var(--color-accent)] truncate">
                          {item.name}
                        </a>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-extrabold text-[var(--color-accent)]">
                            PKR {item.price.toLocaleString()}
                          </p>
                          {item.color && (
                            <span className="text-[10px] font-medium text-[var(--color-muted)] capitalize bg-[var(--color-background)] px-1.5 py-0.5 rounded">
                              {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-[10px] font-semibold text-[var(--color-muted)] bg-[var(--color-background)] px-1.5 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-card-bg)] shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1, item.size, item.color)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-[var(--color-border)] cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-[var(--color-primary)]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1, item.size, item.color)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-[var(--color-border)] cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[var(--color-border)] pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[var(--color-muted)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--color-text-dark)]">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[var(--color-muted)]">
                <span>Delivery</span>
                <span className="font-semibold text-[var(--color-text-dark)]">
                  {checkoutItems.length === 0
                    ? "PKR 0"
                    : deliveryCharge === 0
                      ? "FREE"
                      : `PKR ${deliveryCharge}`}
                </span>
              </div>

              {onlineDiscount > 0 && (
                <div className="flex justify-between text-[var(--color-success)] font-semibold">
                  <span>Online Payment Discount (5%)</span>
                  <span>- PKR {onlineDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-sm font-bold">
                <span>TOTAL</span>
                <span className="text-[var(--color-accent)]">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isOrderMutationLoading || checkoutItems.length === 0}
              className="w-full !py-3.5 text-xs font-bold rounded-xl bg-[var(--color-accent)] text-[var(--color-primary-foreground)] shadow-md cursor-pointer"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Lock size={14} />
                {isOrderMutationLoading
                  ? "PROCESSING..."
                  : `PLACE ORDER • PKR ${totalAmount.toLocaleString()}`}
              </span>
            </Button>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={checkoutItems.length === 0}
              className="w-full py-3 text-xs font-bold rounded-xl bg-[#25D366] hover:brightness-95 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
            >
             <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} className="shrink-0" /> ORDER VIA WHATSAPP
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
