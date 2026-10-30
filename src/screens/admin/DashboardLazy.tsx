"use client";

import dynamic from "next/dynamic";

// recharts is ~100 kB: only admins on /admin ever need it, and never on the server.
const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-card)]" />,
});

export default function DashboardLazy() {
  return <Dashboard />;
}
