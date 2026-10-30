import type { Metadata } from "next";
import Checkout from "@/screens/Checkout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <Checkout />;
}
