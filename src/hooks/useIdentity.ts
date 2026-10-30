"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

// Cart / wishlist / orders / reviews need either a login token or a guest id.
export const useIdentity = () => {
  const token = useSelector((s: RootState) => s.auth?.token);
  const guestId = useSelector((s: RootState) => s.auth?.guestId);
  return { token, guestId, isIdentityReady: !!token || !!guestId };
};
