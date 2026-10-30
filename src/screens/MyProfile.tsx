"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, User, Package, Heart } from "lucide-react";

const MyProfile = () => {
  const router = useRouter();
  const { logoutUser } = useAuth();

  const { user } = useSelector((state: any) => state.auth);

  const initials = `${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase();

  return (
    <main className="min-h-[calc(100vh-5rem)] w-full bg-[var(--color-background)] text-[var(--color-foreground)] flex items-center justify-center px-4 py-10 sm:px-6">

      <section className="w-full max-w-lg">

        {user ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-2xl">

            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-[var(--color-border)]">

              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] border-2 border-[var(--gold)] flex items-center justify-center text-[var(--color-primary-foreground)] font-bold text-xl uppercase shrink-0 shadow-lg">
                {initials || (
                  <User className="w-7 h-7 text-[var(--color-primary-foreground)]" />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-card-foreground)] truncate">
                  {user?.firstname} {user?.lastname}
                </h1>

                <p className="font-sans text-sm text-[var(--color-muted-foreground)] truncate mt-1">
                  {user?.email}
                </p>
              </div>

            </div>

            {/* Account Options */}
            <div className="space-y-3 mt-6">

              <Link href="/orders" className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-semibold font-sans text-[var(--color-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
                <Package className="w-5 h-5 text-[var(--gold)] shrink-0" />
                <span>My Orders</span>
              </Link>
              <Link href="/wishlist" className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-semibold font-sans text-[var(--color-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
                <Heart className="w-5 h-5 text-[var(--gold)] shrink-0" />
                <span>Wishlist</span>
              </Link>

              {user?.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-semibold font-sans text-[var(--color-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all group cursor-pointer"
                >
                  <Settings className="w-5 h-5 text-[var(--gold)] group-hover:rotate-45 transition-transform shrink-0" />

                  <span>Admin Panel</span>
                </button>
              )}

            </div>

            {/* Logout */}
            <div className="pt-8 flex justify-center">

              <button
                onClick={async () => {
                  await logoutUser(); // revokes the refresh token on the server, then clears local state
                  router.push("/");
                }}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-red-500/10 border border-red-500/30 text-[var(--color-danger)] hover:bg-red-500 hover:text-white transition-all text-sm font-semibold font-sans min-w-[160px] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />

                <span>Logout</span>
              </button>

            </div>

          </div>
        ) : (

          /* Guest State */
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl p-7 sm:p-10 shadow-2xl text-center">

            <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] border-2 border-[var(--gold)] flex items-center justify-center mx-auto text-[var(--color-primary-foreground)] shadow-lg">
              <User className="w-9 h-9" />
            </div>

            <div className="mt-6 space-y-2">

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-card-foreground)]">
                Welcome Guest
              </h1>

              <p className="font-sans text-sm text-[var(--color-muted-foreground)] leading-relaxed max-w-sm mx-auto">
                Please sign in to manage your premium collections and profile settings.
              </p>

            </div>

            <div className="pt-7 max-w-xs mx-auto space-y-4">

              <Link
                href="/login"
                className="flex w-full items-center justify-center px-4 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--gold)] text-[var(--color-primary-foreground)] border border-[var(--gold)] text-sm font-bold font-sans uppercase tracking-wider transition-all shadow-md"
              >
                Sign In
              </Link>

              <p className="font-sans text-sm text-[var(--color-muted-foreground)]">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[var(--gold)] hover:underline font-semibold ml-1"
                >
                  Sign Up
                </Link>
              </p>

            </div>

          </div>

        )}

      </section>

    </main>
  );
};

export default MyProfile;
