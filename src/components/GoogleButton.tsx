"use client";
import { useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type Gsi = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: Gsi } };
  }
}

/** "Continue with Google" (Google Identity Services). Renders nothing unless GOOGLE_CLIENT_ID is set on the server. */
export function GoogleButton({ clientId }: { clientId?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { googleLogin } = useAuth();
  if (!clientId) return null;

  const render = () => {
    const gsi = window.google?.accounts.id;
    const el = box.current;
    const isDark = document.documentElement.dataset.theme === "dark";
    if (!gsi || !el) return;
    gsi.initialize({
      client_id: clientId,
      callback: ({ credential }) =>
        googleLogin(credential, { onSuccess: (res) => router.push(res?.role === "admin" ? "/admin" : "/") }),
    });
    gsi.renderButton(el, {
      type: "standard",
      shape: "pill",
      size: "large",
      text: "continue_with",
      logo_alignment: "center",
      theme: isDark ? "filled_black" : "outline",
      width: Math.min(el.clientWidth, 300),
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-[var(--color-muted-foreground)]" role="separator">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        or
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <div ref={box} className="flex h-10 w-full justify-center rounded-full bg-transparent" />
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={render} />
    </>
  );
}
