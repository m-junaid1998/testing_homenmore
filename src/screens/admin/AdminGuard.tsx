"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import AdminLayout from "./AdminLayout";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 text-[var(--color-foreground)]">
        <h1 className="font-display text-2xl font-bold">Admin access only</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {user ? "Your account does not have admin permissions." : "Please sign in with an admin account."}
        </p>
        <Link href={user ? "/" : "/login"} className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold text-sm">
          {user ? "Back to store" : "Sign in"}
        </Link>
      </main>
    );
  }
  return <AdminLayout>{children}</AdminLayout>;
}
