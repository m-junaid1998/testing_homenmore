"use client";

import dynamic from "next/dynamic";

// A draggable floating button: nothing the first paint depends on, so it loads after hydration.
const WhatsAppButton = dynamic(() => import("./WhatsAppButton"), { ssr: false });

export default function LazyWhatsApp() {
  return <WhatsAppButton />;
}
