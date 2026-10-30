import type { Metadata } from "next";
import AboutUs from "@/screens/AboutUs";

export const metadata: Metadata = {
  title: "About Us | Bambotia",
  description: "The story behind Bambotia, a Pakistani jewellery brand of elegant, handcrafted designs.",
};

export default function Page() {
  return <AboutUs />;
}
