"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useGetQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import { STATUS_STYLE } from "@/screens/MyOrders";
import { formatPKR } from "@/utils/helper";

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

// GET /orders/:id - accepts the Mongo id or the order number (BMT-12345678)
export default function OrderDetail({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetQuery(endpoints.orderRoutes.getById(id));
  const order = data?.data;
  const justPlaced = useSearchParams().get("placed") === "1";

  if (isLoading) return <p className="py-24 text-center text-[var(--color-muted-foreground)]">Loading order...</p>;
  if (isError || !order) return <p className="py-24 text-center text-[var(--color-muted-foreground)]">Order not found.</p>;

  const c = order.customerInfo || {};
  const step = STEPS.indexOf(order.status);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[var(--color-foreground)] font-sans">
      {justPlaced && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-[var(--color-success)]">
          <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Thank you! Your order has been placed.</p>
            <p className="text-xs opacity-80">Keep your order number {order.orderNumber}. We will contact you on {order.customerInfo?.phone} to confirm.</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[order.status] || ""}`}>{order.status}</span>
      </div>

      {order.status !== "Cancelled" && (
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center relative">
              <div className={`w-3 h-3 rounded-full z-10 ${i <= step ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
              {i > 0 && <div className={`absolute top-1.5 right-1/2 w-full h-0.5 ${i <= step ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />}
              <span className="text-[10px] mt-1.5 text-[var(--color-muted-foreground)]">{s}</span>
            </div>
          ))}
        </div>
      )}

      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3">
        {order.orderItems?.map((i: any, idx: number) => (
          <div key={idx} className="flex gap-3 text-sm">
            { }
            <img src={i.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1">
              <Link href={`/product/${i.product}`} className="font-semibold hover:text-[var(--color-accent)]">{i.name}</Link>
              <p className="text-xs text-[var(--color-muted-foreground)]">{[i.size, i.color].filter(Boolean).join(" · ")} × {i.qty}</p>
            </div>
            <span className="font-semibold">{formatPKR(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="border-t border-[var(--color-border)] pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Items</span><span>{formatPKR(order.itemsPrice)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{formatPKR(order.shippingPrice)}</span></div>
          <div className="flex justify-between font-bold"><span>Total</span><span className="text-[var(--color-primary)]">{formatPKR(order.totalPrice)}</span></div>
          <p className="text-xs text-[var(--color-muted-foreground)]">Payment: {order.paymentMethod} · {order.isPaid ? "Paid" : "Unpaid"}</p>
        </div>
      </section>

      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 text-sm space-y-1">
        <h2 className="font-bold mb-1">Delivery details</h2>
        <p>{c.fullName} · {c.phone}</p>
        <p className="text-[var(--color-muted-foreground)]">{[c.address, c.areaTown, c.city, c.postalCode, c.country].filter(Boolean).join(", ")}</p>
        {c.orderNotes && <p className="text-[var(--color-muted-foreground)]">Notes: {c.orderNotes}</p>}
      </section>

      <Link href="/orders" className="text-sm text-[var(--color-accent)] font-semibold">← All my orders</Link>
    </main>
  );
}
