"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import dynamic from "next/dynamic";
import { makeStore, persistAuth, readSavedAuth, type AppStore } from "@/redux/store";
import { hydrateAuth, identitySettled, logoutState, setGuestId, setToken } from "@/redux/authSlice";
import { endpoints } from "@/api/config";
import { AppSplash } from "@/components/AppSplash";

const AppToaster = dynamic(() => import("@/components/AppToaster"), { ssr: false }); // not needed for the first paint

/**
 * Boot sequence (a single effect, runs once in the browser):
 *   1. read the saved user / guest id from localStorage -> auth.hydrated
 *   2. a saved user gets a fresh access token from the refresh cookie (the token itself is never stored)
 *   3. visitors with neither a login nor a guest id get a guest id (cart / wishlist / orders need it)
 * The page itself is already server-rendered, so none of this blocks the first paint.
 */
function useBootstrap(store: AppStore) {
  useEffect(() => {
    const saved = readSavedAuth();
    store.dispatch(hydrateAuth({ user: saved?.user ?? null, guestId: saved?.guestId ?? null }));
    const stopSaving = persistAuth(store);

    const settle = () => store.dispatch(identitySettled());
    const getGuestId = () =>
      fetch(`/api/${endpoints.auth.guest}`)
        .then((r) => r.json())
        .then((d) => d?.guestId && store.dispatch(setGuestId(d.guestId)))
        .catch(() => {}) // the catalog works without a guest id, so a failure must not block the shop
        .finally(settle);

    if (saved?.user) {
      fetch(`/api/${endpoints.auth.refresh}`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => store.dispatch(d?.accessToken ? setToken(d.accessToken) : logoutState()))
        .catch(() => store.dispatch(logoutState()))
        .finally(() => (store.getState().auth.token || saved.guestId ? settle() : getGuestId()));
    } else if (saved?.guestId) {
      settle();
    } else {
      getGuestId();
    }
    return stopSaving;
  }, [store]);
}

export function Providers({ children }: { children: ReactNode }) {
  // One store per render tree: a module-level store would be shared between visitors on the server.
  const [store] = useState(makeStore);
  useBootstrap(store);

  return (
    <Provider store={store}>
      <AppSplash />
      <AppToaster />
      {children}
    </Provider>
  );
}
