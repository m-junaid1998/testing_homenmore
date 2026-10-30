"use client";

import { useGetQuery, useCrudMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";
import { useIdentity } from "./useIdentity";
import { QA } from "../api/queryArgs";

export interface CartVariant extends ApiHandlerOptions {
  size?: string; // required by the backend when the product has sizes
  color?: string; // required by the backend when the product has colors
}

const sameLine = (item: any, pId: string, size?: string, color?: string) =>
  (item.product?._id || item.product) === pId &&
  (size === undefined || (item.size || "").toLowerCase() === size.toLowerCase()) &&
  (color === undefined || (item.color || "").toLowerCase() === color.toLowerCase());

// Badge-only version: no mutation / handler hooks, so the navbar does not re-render on cart actions' loading states.
export const useCartCount = () => {
  const { isIdentityReady } = useIdentity();
  const q = useGetQuery(QA.cart, { skip: !isIdentityReady });
  const items: any[] = q.data?.data?.cartItems || [];
  return items.reduce((acc, i) => acc + (i.qty || 0), 0);
};

export const useCart = (autoFetch = true) => {
  const { isIdentityReady } = useIdentity();
  const [crudMutation, { isLoading: isCartMutationLoading }] = useCrudMutation();
  const { handleApiCall } = useApiHandler();

  const queryResult = useGetQuery(QA.cart, {
    skip: !autoFetch || !isIdentityReady,
  });
  // Mutations invalidate the "Cart" tag, so every component showing the cart (navbar badge,
  // drawer, product cards, checkout) refreshes together.
  const refetchCart = () => (autoFetch && isIdentityReady ? queryResult.refetch() : undefined);

  const cartItems: any[] = queryResult.data?.data?.cartItems || [];

  const mutateCart = async (
    endpoint: string,
    method: "POST" | "DELETE",
    data?: any,
    options?: ApiHandlerOptions,
    params?: Record<string, any>
  ) => {
    const res = await handleApiCall(crudMutation({ endpoint, method, data, params, tags: ["Cart"] }).unwrap(), options);
    return res;
  };

  // POST /cart { product, qty, isDirectUpdate, size, color }
  // qty is added to the line unless isDirectUpdate=true (then it replaces it); <= 0 removes the line.
  const addToCart = (product: string, qty = 1, isDirectUpdate = false, options?: CartVariant) => {
    const { size, color, ...handlerOptions } = options || {};
    return mutateCart(
      endpoints.cartRoutes.base,
      "POST",
      { product, qty, isDirectUpdate, size, color },
      { errorMessage: "Failed to update cart.", ...handlerOptions }
    );
  };

  // DELETE /cart/:productId?size=&color= (without them every line of the product is removed)
  const removeFromCart = (productId: string, productName?: string, options?: CartVariant) => {
    const { size, color, ...handlerOptions } = options || {};
    const msg = productName
      ? `"${productName}" has been removed from your cart.`
      : "Product has been removed from your cart.";
    return mutateCart(
      endpoints.cartRoutes.removeProduct(productId),
      "DELETE",
      undefined,
      { errorMessage: "Failed to remove item.", successMessage: msg, ...handlerOptions },
      { size, color }
    );
  };

  const clearCart = (options?: ApiHandlerOptions) =>
    mutateCart(endpoints.cartRoutes.base, "DELETE", undefined, {
      errorMessage: "Failed to clear cart.",
      successMessage: "",
      ...options,
    });

  const isInCart = (pId: string) => cartItems.some((i) => sameLine(i, pId));
  const getItemQty = (pId: string, size?: string, color?: string) =>
    cartItems.filter((i) => sameLine(i, pId, size, color)).reduce((a, i) => a + (i.qty || 0), 0);
  const totalItemsCount = cartItems.reduce((acc, i) => acc + (i.qty || 0), 0);
  // `price` is the unit price for the chosen size, calculated by the backend.
  const cartTotalAmount = cartItems.reduce(
    (acc, i) => acc + (i.price ?? i.product?.salePrice ?? 0) * (i.qty || 0),
    0
  );

  return {
    cartQuery: queryResult,
    cart: queryResult.data?.data,
    cartItems,
    totalItemsCount,
    cartTotalAmount,
    isLoadingCart: queryResult.isLoading,
    isCartMutationLoading,
    refetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQty,
  };
};
