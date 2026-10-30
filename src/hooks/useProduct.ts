"use client";

import {useGetQuery, useLazyGetQuery, useCrudMutation, useUploadMutation} from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";
import { QA } from "../api/queryArgs";
import type { PaginationParams } from "./Pagination/usePaginationParams";

export const useProduct = (params?: PaginationParams) => {
  const [crudMutation, { isLoading: isCrudLoading }] = useCrudMutation();
  const [uploadMutation, { isLoading: isUploadLoading }] = useUploadMutation();
  const [triggerGetProducts, { isLoading: isProductLazyLoading }] =useLazyGetQuery();
  const { handleApiCall } = useApiHandler();

  const isProductMutationLoading = isCrudLoading || isUploadLoading;

  const queryResult = useGetQuery(
    { endpoint: endpoints.productRoutes.getAll, params },
    { skip: !params },
  );

  const { refetch } = queryResult;
  const exec = async (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    data?: any,
    isUpload = false,
    options?: ApiHandlerOptions,
  ) => {
    const mutation = isUpload ? uploadMutation : crudMutation;
    const res = await handleApiCall(
      mutation({ endpoint, method, data }).unwrap(),
      options,
    );
    if (res?.success && params) refetch();
    return res;
  };

  return {
    productsQuery: queryResult,
    products: queryResult.data?.data || [],
    pagination: queryResult.data?.pagination || null,
    isLoadingProducts: queryResult.isLoading,
    refetchProducts: refetch,
    isProductMutationLoading,
    isProductLazyLoading,

    getProducts: (customParams?: PaginationParams, options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetProducts({
          endpoint: endpoints.productRoutes.getAll,
          params: customParams || params,
        }).unwrap(),
        { errorMessage: "Failed to fetch products.", ...options },
      ),

    createProduct: (data: FormData | Record<string, any>,options?: ApiHandlerOptions) =>
      exec(endpoints.productRoutes.create, "POST", data, true, {
        successMessage: "Product created successfully.",
        errorMessage: "Failed to create product.",
        ...options,
      }),

    updateProduct: (id: string | number, data: FormData | Record<string, any>, options?: ApiHandlerOptions) =>
      exec(endpoints.productRoutes.update(id), "PUT", data, true, {
        successMessage: "Product updated successfully.",
        errorMessage: "Failed to update product.",
        ...options,
      }),

    deleteProduct: (id: string | number, options?: ApiHandlerOptions) =>
      exec(endpoints.productRoutes.delete(id), "DELETE", undefined, false, {
        successMessage: "Product deleted successfully.",
        errorMessage: "Failed to delete product.",
        ...options,
      }),

    togglePublishStatus: ( id: string | number | (string | number)[], options?: ApiHandlerOptions) => {
    const targetIds = Array.isArray(id) ? id : [id];
     return exec(endpoints.productRoutes.patch, "PATCH", { id: targetIds }, false, {
        successMessage: options?.successMessage || "Publish status updated.",
        errorMessage: "Failed to update status.",
        ...options,
      });
     },
  };
};

// GET /products/product/:id  +  GET /products/related/:id
export const useProductDetail = (id?: string) => {
  const detail = useGetQuery(QA.product(id || ""), { skip: !id });
  const related = useGetQuery(QA.related(id || ""), { skip: !id });
  return {
    product: detail.data?.data,
    isLoadingProduct: detail.isLoading,
    isProductError: detail.isError,
    relatedProducts: related.data?.data || [],
    isLoadingRelated: related.isLoading,
  };
};

// Storefront home sections: GET /products/best-sellers, /products/top-rated
export const useFeaturedProducts = (limit = 10) => {
  const best = useGetQuery(QA.bestSellers(limit));
  const top = useGetQuery(QA.topRated(limit));
  return {
    bestSellers: best.data?.data || [],
    topRated: top.data?.data || [],
    isLoadingBestSellers: best.isLoading,
    isLoadingTopRated: top.isLoading,
  };
};

// Home page "New Arrivals": read-only, shares its cache key with the server prefetch.
export const useNewArrivals = () => {
  const q = useGetQuery(QA.newArrivals);
  return { products: q.data?.data || [], isLoadingProducts: q.isLoading };
};
