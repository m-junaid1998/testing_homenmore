import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { Redis } from "@upstash/redis";
import type { ApiRequest, ApiResponse } from "../types";

/**
 * Cache for public data. With UPSTASH_REDIS_REST_URL / _TOKEN set it lives in Redis (survives restarts and deploys);
 * without them it lives in memory. Either way an admin write calls invalidate(namespace): the namespace's version
 * number goes up, so every old key is simply never read again (no key lists, no scanning), and the server-rendered
 * pages are refreshed through their tag (api:<namespace>).
 * If Redis is slow or down the request goes straight to MongoDB, and Redis is skipped for 30 seconds.
 */
export const NS = { products: "products", categories: "categories", categoryImages: "catimages", media: "media", settings: "settings" } as const;
type Namespace = (typeof NS)[keyof typeof NS];

const TTL_SECONDS: Record<Namespace, number> = { products: 300, categories: 3600, catimages: 3600, media: 900, settings: 3600 };
const TIMEOUT_MS = 2000;
const PAUSE_MS = 30_000;

const clean = (value?: string) => (value ?? "").trim().replace(/^["']|["']$/g, "");
const redis = clean(process.env.UPSTASH_REDIS_REST_URL).startsWith("https://") && clean(process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({ url: clean(process.env.UPSTASH_REDIS_REST_URL), token: clean(process.env.UPSTASH_REDIS_REST_TOKEN), retry: false })
  : null;

// on globalThis so every route bundle shares them
const g = globalThis as unknown as { apiCache?: { memory: Map<string, { value: unknown; expires: number }>; versions: Map<string, number>; pausedUntil: number } };
const state = (g.apiCache ??= { memory: new Map(), versions: new Map(), pausedUntil: 0 });

const withTimeout = <T>(promise: Promise<T>) => Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("redis timeout")), TIMEOUT_MS))]);

const version = async (ns: Namespace) => {
  if (!state.versions.has(ns)) state.versions.set(ns, Number(await withTimeout(redis!.get(`bambotia:v:${ns}`))) || 0);
  return state.versions.get(ns)!;
};

export const cached = async <T>(ns: Namespace, params: unknown, load: () => Promise<T>): Promise<T> => {
  const hash = crypto.createHash("sha1").update(JSON.stringify(params)).digest("hex").slice(0, 20);

  if (redis) {
    if (Date.now() < state.pausedUntil) return load();
    try {
      const key = `bambotia:${ns}:${await version(ns)}:${hash}`;
      const hit = await withTimeout(redis.get<T>(key));
      if (hit != null) return hit;
      const value = await load();
      if (value != null) void redis.set(key, value, { ex: TTL_SECONDS[ns] }).catch(() => undefined); // the visitor does not wait for the write
      return value;
    } catch (err) {
      if (!(err as Error).message.includes("redis")) throw err; // a MongoDB error is not a cache problem
      state.pausedUntil = Date.now() + PAUSE_MS;
      return load();
    }
  }

  const key = `${ns}:${hash}`;
  const hit = state.memory.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await load();
  if (value != null) {
    if (state.memory.size >= 500) state.memory.clear(); // search terms are user input: keep memory bounded
    state.memory.set(key, { value, expires: Date.now() + TTL_SECONDS[ns] * 1000 });
  }
  return value;
};

export const invalidate = async (...namespaces: Namespace[]) => {
  for (const key of state.memory.keys()) if (namespaces.some((ns) => key.startsWith(`${ns}:`))) state.memory.delete(key);
  if (redis) {
    await Promise.all(
      namespaces.map(async (ns) => {
        try {
          state.versions.set(ns, await withTimeout(redis.incr(`bambotia:v:${ns}`)));
        } catch {
          state.versions.delete(ns); // Redis is down: the TTL still expires old entries
        }
      })
    );
  }
  namespaces.forEach((ns) => revalidateTag(`api:${ns}`, { expire: 0 }));
};

// Browser / CDN caching for public GET responses. Requests with a login token are never publicly cached.
export const setHttpCache = (req: ApiRequest, res: ApiResponse, maxAge = 60) => {
  res.set("Cache-Control", req.headers.authorization ? "private, no-store" : `public, max-age=${maxAge}, s-maxage=${maxAge * 2}, stale-while-revalidate=${maxAge * 10}`);
};
