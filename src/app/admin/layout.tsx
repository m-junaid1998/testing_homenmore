import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminGuard from "@/screens/admin/AdminGuard";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
