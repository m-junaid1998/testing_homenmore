import Setting from "../models/Setting";
import asyncHandler from "../utils/asyncHandler";
import { fail, ok } from "../utils/respond";
import { invalidate, NS, setHttpCache } from "../utils/cache";
import { loadShippingRules } from "../utils/shippingRules";

const isMoney = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 100_000_000;

// Public: the storefront shows these numbers and the order API uses the same ones.
export const getShippingSettings = asyncHandler(async (req, res) => {
  setHttpCache(req, res, 30);
  return ok(res, await loadShippingRules());
});

// Admin only (see routes.ts)
export const updateShippingSettings = asyncHandler(async (req, res) => {
  const { deliveryCharge, freeShippingAbove } = req.body;
  if (!isMoney(deliveryCharge) || !isMoney(freeShippingAbove)) {
    return fail(res, 400, "Delivery charge and free-delivery amount must be whole numbers (PKR), 0 or more.");
  }
  await Setting.updateOne({ key: "shipping" }, { $set: { deliveryCharge, freeShippingAbove } }, { upsert: true });
  await invalidate(NS.settings);
  return ok(res, await loadShippingRules(), "Delivery settings saved.");
});
