"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetsQuery } from "@/api/apiSlice";
import { QA } from "@/api/queryArgs";
import { PageLoader } from "./PageLoader";

const SEEN_KEY = "bambotia:splash-seen";

/**
 * First visit: the loader stays until the start-up requests are done (saved login, guest id, categories, cart, wishlist).
 * Returning visitors in the same session never see it (<html data-splash-seen>, set before first paint in app/layout.tsx).
 * If an API is slow or down it still leaves after 2.5 s (CSS animation in globals.css), so the shop is never blocked.
 */
export function AppSplash() {
  const [gone, setGone] = useState(false);
  const { hydrated, identitySettled, token, guestId } = useSelector((s: RootState) => s.auth);

  const identityReady = identitySettled && !!(token || guestId);
  const categories = useGetsQuery(QA.categories);
  const cart = useGetsQuery(QA.cart, { skip: !identityReady });
  const wishlist = useGetsQuery(QA.wishlist, { skip: !identityReady });

  // a guest id that could not be fetched (API down) must not keep the loader up: carts then simply do not load
  const waiting = identityReady && (cart.isLoading || wishlist.isLoading);
  const ready = hydrated && identitySettled && !categories.isLoading && !waiting;

  const finish = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setGone(true);
  };

  if (gone) return null;
  return <div id="app-splash" onTransitionEnd={finish} onAnimationEnd={finish} className={`transition-opacity duration-300 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}><PageLoader /></div>;
}
