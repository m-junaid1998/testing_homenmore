import type { Metadata } from "next";
import Contact from "@/screens/Contact";

export const metadata: Metadata = {
  title: "Contact | Bambotia",
  description: "Get in touch with Bambotia about a piece, an order or delivery.",
};

export default function Page() {
  return <Contact />;
}
