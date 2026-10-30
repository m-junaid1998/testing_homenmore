import type { Metadata } from "next";
import Wishlist from "@/components/Wishlist";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <Wishlist />;
}
