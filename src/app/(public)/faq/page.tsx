import type { Metadata } from "next";
import Faq from "@/screens/Faq";

export const metadata: Metadata = {
  title: "FAQ | Bambotia",
  description: "Answers about ordering, payment, delivery, returns and jewellery care at Bambotia.",
};

export default function Page() {
  return <Faq />;
}
