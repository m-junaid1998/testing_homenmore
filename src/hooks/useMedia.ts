"use client";

import { useGetQuery, useLazyGetQuery, useCrudMutation, useUploadMutation, type GenericArg } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";
import type { PaginationParams } from "./Pagination/usePaginationParams";

export interface MediaFilters extends PaginationParams {
  type?: "image" | "video" | "ALL" | string;
  key?: "carousel" | "promotions" | "ALL" | string;
  media?: any;
}
export const useMedia = (params?: MediaFilters) => {
  const [crudMutation, { isLoading: isCrudLoading }] = useCrudMutation();
  const [uploadMutation, { isLoading: isUploadLoading }] = useUploadMutation();
  const [triggerGetMedia, { isLoading: isMediaLazyLoading }] = useLazyGetQuery();
  const { handleApiCall } = useApiHandler();

const mediaQuery = useGetQuery(
    { endpoint: endpoints.mediaRoutes.getupload, params },
    { skip: !params }
  );

  const exec = async (endpoint: string, method: "POST" | "DELETE", data?: any, isUpload = false, opts?: ApiHandlerOptions) => {
    const mutation = isUpload ? uploadMutation : crudMutation;
    const res = await handleApiCall(mutation({ endpoint, method, data }).unwrap(), opts);
    if (res?.success && params) mediaQuery.refetch();
    return res;
  };

  return {
    mediaQuery,
    mediaList: mediaQuery.data?.data || [],
    pagination: mediaQuery.data?.pagination || null,
    isLoadingMedia: mediaQuery.isLoading,
    refetchMedia: mediaQuery.refetch,
    isMediaMutationLoading: isCrudLoading || isUploadLoading,
    isMediaLazyLoading,

    getMedia: (customParams?: MediaFilters, options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetMedia({ endpoint: endpoints.mediaRoutes.getupload, params: customParams || params }).unwrap(),
        { errorMessage: "Failed to fetch media records.", ...options }
      ),

    uploadMedia: (data: FormData, options?: ApiHandlerOptions) =>
      exec(endpoints.mediaRoutes.createupload, "POST", data, true, { successMessage: "Media uploaded successfully.", errorMessage: "Failed to upload media.", ...options }),

    deleteMedia: (id: string | number, options?: ApiHandlerOptions) =>
      exec(endpoints.mediaRoutes.deleteupload(id), "DELETE", undefined, false, { successMessage: "Media deleted successfully.", errorMessage: "Failed to delete media.", ...options }),
  };
};
// Storefront (carousel / reels): read-only, no mutation hooks per component.
export const useMediaList = (arg: GenericArg) => {
  const q = useGetQuery(arg);
  return { mediaList: (q.data?.data || []) as any[], isLoadingMedia: q.isLoading };
};
