import "server-only";
import { serverGet } from "@/server/ssr";
import type { GenericArg } from "./apiSlice";
import type { PrefillEntry } from "./PrefillQueries";

type Tag = "products" | "categories" | "catimages" | "media" | "settings";

/** Fetches (in-process, cached) the same GET a client hook would make and wraps it for <PrefillQueries>. */
export async function prefetch(arg: GenericArg | string, tag: Tag): Promise<PrefillEntry> {
  const endpoint = typeof arg === "string" ? arg : arg.endpoint;
  const params = typeof arg === "string" ? {} : arg.params || {};
  const value = await serverGet("/" + endpoint, params, { tag });
  return value ? { arg, value } : null;
}
