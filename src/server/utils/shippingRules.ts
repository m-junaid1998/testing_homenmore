import Setting from "../models/Setting";
import { cached, NS } from "./cache";
import { DEFAULT_SHIPPING_RULES, type ShippingRules } from "../../utils/shipping";

// Read on every cart and order; the cache is cleared when the admin saves new settings.
export const loadShippingRules = () =>
  cached<ShippingRules>(NS.settings, "shipping", async () => {
    const saved = await Setting.findOne({ key: "shipping" }).lean();
    return {
      ...DEFAULT_SHIPPING_RULES,
      ...(typeof saved?.deliveryCharge === "number" && { deliveryCharge: saved.deliveryCharge }),
      ...(typeof saved?.freeShippingAbove === "number" && { freeShippingAbove: saved.freeShippingAbove }),
    };
  });
