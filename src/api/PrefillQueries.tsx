"use client";

import { useRef } from "react";
import { useStore } from "react-redux";
import { apiSlice, type GenericArg } from "./apiSlice";

export type PrefillEntry = { arg: GenericArg | string; value: unknown } | null;

/**
 * Puts data that the SERVER already fetched into the RTK Query cache before any hook reads it.
 * The hooks then start in the "fulfilled" state: the HTML contains real content (SSR) and the
 * browser makes no duplicate request. Must render before the components that read the data.
 */
export function PrefillQueries({ entries }: { entries: PrefillEntry[] }) {
  const store = useStore();
  const done = useRef<true | null>(null);

  // Initialise-once pattern (the only form React allows for a ref during render).
  if (done.current == null) {
    done.current = true;
    const valid = entries.filter((e): e is NonNullable<PrefillEntry> => !!e && e.value != null);
    if (valid.length) {
      store.dispatch(
        apiSlice.util.upsertQueryEntries(
          valid.map((e) => ({ endpointName: "gets" as const, arg: e.arg, value: e.value }))
        )
      );
    }
  }
  return null;
}
