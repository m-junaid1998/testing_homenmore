import mongoose from "mongoose";

/** Request values are untrusted: always turn them into plain strings before using them in a database query. */
export const text = (value: unknown, maxLength = 200): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const isObjectId = (value: unknown): boolean =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value) && /^[a-f\d]{24}$/i.test(value);

/** Makes user text safe to put inside a regular expression (search boxes). */
export const escapeRegex = (value: string) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

export const toInt = (value: unknown, fallback: number, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
