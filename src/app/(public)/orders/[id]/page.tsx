import type { Metadata } from "next";
import { Suspense } from "react";
import OrderDetail from "@/screens/OrderDetail";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <OrderDetail id={id} />
    </Suspense>
  );
}
