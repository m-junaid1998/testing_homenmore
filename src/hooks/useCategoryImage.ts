"use client";

import { useGetQuery, useLazyGetQuery, useCrudMutation, useUploadMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";

export const useCategoryImage = () => {
  const [crudMutation, { isLoading: isCrudLoading }] = useCrudMutation();
  const [uploadMutation, { isLoading: isUploadLoading }] = useUploadMutation();
  const [triggerGetCategoryImages, { isLoading: isLazyLoading }] = useLazyGetQuery();
  const { handleApiCall } = useApiHandler();

  const categoriesListQuery = useGetQuery(endpoints.categoryimageRoutes.getCategoriesList);
  const categoryImagesQuery = useGetQuery(endpoints.categoryimageRoutes.getAll);


  const exec = async (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE",
    data?: any,
    isUpload = false,
    options?: ApiHandlerOptions
  ) => {
    const mutation = isUpload ? uploadMutation : crudMutation;
    const res = await handleApiCall(mutation({ endpoint, method, data }).unwrap(), options);
    if (res?.success) categoryImagesQuery.refetch();
    return res;
  };

  return {
    categoriesList: categoriesListQuery.data?.data || [],
    isLoadingCategoriesList: categoriesListQuery.isLoading,
    refetchCategoriesList: categoriesListQuery.refetch,

    categoryImagesQuery,
    categoryImages: categoryImagesQuery.data?.data || [],
    totalCount: categoryImagesQuery.data?.count || 0,
    isLoadingCategoryImages: categoryImagesQuery.isLoading,
    refetchCategoryImages: categoryImagesQuery.refetch,

    isMutationLoading: isCrudLoading || isUploadLoading,
    isLazyLoading,

    getAllCategoryImages: (options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetCategoryImages(endpoints.categoryimageRoutes.getAll).unwrap(),
        { errorMessage: "Failed to fetch category images.", ...options }
      ),

    uploadCategoryImage: (data: any, options?: ApiHandlerOptions) =>
      exec(endpoints.categoryimageRoutes.upload, "POST", data, true, {
        successMessage: "Category image uploaded successfully.",
        errorMessage: "Failed to upload category image.",
        ...options,
      }),

    updateCategoryImage: (id: string | number, data: any, options?: ApiHandlerOptions) =>
      exec(endpoints.categoryimageRoutes.updateCategoryImage(id), "PUT", data, true, {
        successMessage: "Category image updated successfully.",
        errorMessage: "Failed to update category image.",
        ...options,
      }),

    deleteCategoryImage: (id: string | number, options?: ApiHandlerOptions) =>
      exec(endpoints.categoryimageRoutes.delete(id), "DELETE", undefined, false, {
        successMessage: "Category image deleted successfully.",
        errorMessage: "Failed to delete category image.",
        ...options,
      }),
  };
};
// Home page "Shop by Category" tiles: read-only (the admin hook above also loads the category list).
export const useCategoryImages = () => {
  const q = useGetQuery(endpoints.categoryimageRoutes.getAll);
  return { categoryImages: (q.data?.data || []) as any[], isLoadingCategoryImages: q.isLoading };
};
