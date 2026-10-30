import type { Metadata } from "next";
import PrivacyPolicy from "@/screens/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | Bambotia",
  description: "How Bambotia collects, uses and protects your personal information.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
