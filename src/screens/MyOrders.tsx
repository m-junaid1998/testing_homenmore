"use client";

import Link from "next/link";
import { useOrder } from "@/hooks/useOrder";
import { Skeleton } from "@/components/Skeleton";
import { formatPKR } from "@/utils/helper";

export const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Processing: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  Shipped: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  Delivered: "bg-emerald-500/15 text-[var(--color-success)]",
  Cancelled: "bg-rose-500/15 text-[var(--color-danger)]",
};

// GET /orders/myorders - works for logged-in users and guests (by x-guest-id)
export default function MyOrders() {
  const { myOrders, isLoadingMyOrders } = useOrder();

  return (
    <main className="max-w-4xl mx-auto min-h-[70vh] px-4 sm:px-6 py-8 text-[var(--color-foreground)] font-sans">
      <h1 className="font-display text-2xl font-bold mb-5">My orders</h1>
      {isLoadingMyOrders ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-[var(--color-muted-foreground)]">You have not placed any orders yet.</p>
          <Link href="/shop" className="text-[var(--color-accent)] font-semibold">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o: any) => (
            <Link key={o._id} href={`/orders/${o.orderNumber}`} className="block bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-2xl p-4 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold">{o.orderNumber}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status] || ""}`}>{o.status}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-[var(--color-muted-foreground)]">
                <span>{new Date(o.createdAt).toLocaleDateString()} · {o.orderItems?.length} item(s)</span>
                <span className="font-bold text-[var(--color-primary)]">{formatPKR(o.totalPrice)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
