"use client";

import { useIdentity } from "./useIdentity";
import { QA } from "../api/queryArgs";
import { useGetQuery, useCrudMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";

// Badge-only version (see useCartCount).
export const useWishlistCount = () => {
  const { isIdentityReady } = useIdentity();
  const q = useGetQuery(QA.wishlist, { skip: !isIdentityReady });
  return (q.data?.data?.products?.length || 0) as number;
};

export const useWishlist = (autoFetch = true) => {
  const { isIdentityReady } = useIdentity();
  const [crudMutation, { isLoading: isWishlistMutationLoading }] = useCrudMutation();
  const { handleApiCall } = useApiHandler();

  const queryResult = useGetQuery(QA.wishlist, {
    skip: !autoFetch || !isIdentityReady,
  });

  const refetchWishlist = () => (autoFetch && isIdentityReady ? queryResult.refetch() : undefined);

  const executeWishlistRequest = async (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    data?: any,
    options?: ApiHandlerOptions
  ) => {
    const res = await handleApiCall(
      crudMutation({ endpoint, method, data, tags: ["Wishlist"] }).unwrap(),
      options
    );
    return res;
  };

  const wishlistData = queryResult.data?.data;
  const wishlistProducts = wishlistData?.products || [];

  const toggleWishlist = (productId: string, options?: ApiHandlerOptions) =>
    executeWishlistRequest(endpoints.wishlistRoutes.base, "POST", { productId }, {
      errorMessage: "Failed to update wishlist.",
      ...options,
    });

  const clearWishlist = async (options?: ApiHandlerOptions) => {
    if (!wishlistProducts.length) return { success: true };
    for (const prod of wishlistProducts) {
      const pId = typeof prod === "string" ? prod : prod._id;
      await crudMutation({
        endpoint: endpoints.wishlistRoutes.base,
        method: "POST",
        data: { productId: pId },
        tags: ["Wishlist"],
      }).unwrap();
    }

    refetchWishlist();
    return handleApiCall(
      Promise.resolve({
        success: true,
        message: options?.successMessage || "Wishlist cleared successfully",
      }),
      options
    );
  };

  const isInWishlist = (productId: string): boolean =>
    wishlistProducts.some((p: any) => p._id === productId || p === productId);

  return {
    wishlistQuery: queryResult,
    wishlist: wishlistData,
    wishlistProducts,
    isLoadingWishlist: queryResult.isLoading,
    isWishlistMutationLoading,
    refetchWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
  };
};