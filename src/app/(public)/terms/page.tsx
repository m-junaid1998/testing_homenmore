import type { Metadata } from "next";
import TermsOfService from "@/screens/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service | Bambotia",
  description: "The terms for ordering, payment, delivery and returns at Bambotia.",
};

export default function Page() {
  return <TermsOfService />;
}
