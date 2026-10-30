"use client";
import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      duration={2000}
      toastOptions={{
        style: {
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          borderColor: "var(--color-border)",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}
