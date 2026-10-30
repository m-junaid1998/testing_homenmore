import type { Metadata } from "next";
import MyProfile from "@/screens/MyProfile";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <MyProfile />;
}
