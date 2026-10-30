import type { Metadata } from "next";
import MyOrders from "@/screens/MyOrders";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <MyOrders />;
}
