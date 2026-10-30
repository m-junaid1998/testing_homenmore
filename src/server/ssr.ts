import "server-only";
import { unstable_cache } from "next/cache";
import { dispatch } from "@/server/dispatch";
import { DEFAULT_SHIPPING_RULES, type ShippingRules } from "@/utils/shipping";

type Query = Record<string, string | number | boolean | undefined>;

async function run(path: string, query: Query) {
  const clean: Record<string, string> = {};
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== "") clean[k] = String(v);
  });
  const res = await dispatch({ method: "GET", path, query: clean });
  // Server errors throw so unstable_cache does NOT remember them; "not found" (4xx) is a real, cacheable answer.
  if (res.status >= 500) throw new Error(`API ${path} -> ${res.status}: ${(res.body as { message?: string })?.message ?? ""}`);
  if (res.status >= 400) return null;
  // Plain JSON only (ObjectIds/Dates -> strings) so it can cross into client components.
  return JSON.parse(JSON.stringify(res.body));
}

/**
 * Server-side GET against our own API, in-process (no HTTP hop).
 * Cached in the Next.js data cache; `invalidate()` in server/utils/cache.ts purges it by `api:<namespace>`
 * tag whenever the admin changes products / categories / media. Returns null on failure unless `strict`.
 */
export async function serverGet<T = any>(
  path: string,
  query: Query = {},
  opts: { tag: "products" | "categories" | "catimages" | "media" | "settings"; revalidate?: number; strict?: boolean } = { tag: "products" }
): Promise<T | null> {
  const key = ["api", path, JSON.stringify(query, Object.keys(query).sort())];
  try {
    const cached = unstable_cache(() => run(path, query), key, {
      tags: [`api:${opts.tag}`],
      revalidate: opts.revalidate ?? 300,
    });
    return (await cached()) as T | null;
  } catch (err) {
    console.error(`[ssr] ${path} failed:`, (err as Error).message);
    // strict: a real lookup (product / category page). Failing loudly gives a 5xx that crawlers retry,
    // instead of a 404 that could make Google drop a good page during a short database outage.
    if (opts.strict) throw err;
    return null;
  }
}

/** Delivery charge / free-delivery amount / online discount for server components. Falls back to the defaults if the database is down. */
export async function getShippingRules(): Promise<ShippingRules> {
  const res = await serverGet<{ data: ShippingRules }>("/settings/shipping", {}, { tag: "settings", revalidate: 60 });
  return res?.data ?? DEFAULT_SHIPPING_RULES;
}
