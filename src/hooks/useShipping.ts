"use client";

import { useGetsQuery, useCrudMutation } from "../api/apiSlice";
import { useApiHandler } from "../api/useApiHandler";
import { QA } from "../api/queryArgs";
import { endpoints } from "../api/config";
import { DEFAULT_SHIPPING_RULES, type ShippingRules } from "../utils/shipping";

/** Current delivery rules. Already in the cache when the page is server-rendered; defaults only while loading. */
export const useShippingRules = (): ShippingRules => {
  const { data } = useGetsQuery(QA.shipping);
  return data?.data ?? DEFAULT_SHIPPING_RULES;
};

/** Admin: save the delivery charge and the free-delivery amount. */
export const useShippingSettings = () => {
  const rules = useShippingRules();
  const [mutate, { isLoading }] = useCrudMutation();
  const { handleApiCall } = useApiHandler();

  const saveShipping = (data: Pick<ShippingRules, "deliveryCharge" | "freeShippingAbove">) =>
    handleApiCall(mutate({ endpoint: endpoints.settingsRoutes.shipping, method: "PUT", data, tags: ["Settings"] }).unwrap(), {
      errorMessage: "Could not save delivery settings.",
    });

  return { rules, saveShipping, isSaving: isLoading };
};
