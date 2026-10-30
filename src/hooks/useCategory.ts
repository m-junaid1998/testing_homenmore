"use client";

import { useGetsQuery, useLazyGetsQuery, useCrudMutation } from "../api/apiSlice";
import { QA } from "../api/queryArgs";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";

export interface CategoryPayload {
  categoryname: string;
  subCategories?: string[];
}

export interface ReorderCategoryItem {
  id: string;
  order: number;
}

// Query params the backend reads on GET /categories/allcategories
export interface CategoryQueryParams extends Record<string, any> {
  currentPage?: number;
  pageSize?: number;
  searchString?: string;
  sortOn?: "order" | "categoryname" | "createdAt";
  sortDirection?: "asc" | "desc";
  isAllRecord?: boolean;
  fromDate?: string;
  toDate?: string;
}

// Without params the whole list is loaded (navbar / footer / filters need every category).
export const useCategory = (params?: CategoryQueryParams) => {
  const queryParams = params ?? { isAllRecord: true };
  const [crudMutation, { isLoading: isCategoryMutationLoading }] = useCrudMutation();
  const [triggerGetCategories, { isLoading: isCategoryLazyLoading }] = useLazyGetsQuery();
  const { handleApiCall } = useApiHandler();

  const queryResult = useGetsQuery(
    params ? { endpoint: endpoints.categories.base, params: queryParams, tags: ["Category"] } : QA.categories
  );

  // Mutations invalidate the "Category" tag, so the list refetches by itself.
  const exec = (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE",
    data?: any,
    options?: ApiHandlerOptions
  ) => handleApiCall(crudMutation({ endpoint, method, data, tags: ["Category"] }).unwrap(), options);

  return {
    categoriesQuery: queryResult,
    categories: queryResult.data?.data || [],
    pagination: queryResult.data?.pagination || null,
    isLoadingCategories: queryResult.isLoading,
    isFetchingCategories: queryResult.isFetching,
    refetchCategories: queryResult.refetch,
    isCategoryMutationLoading,
    isCategoryLazyLoading,

    getCategories: (customParams?: CategoryQueryParams, options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetCategories({
          endpoint: endpoints.categories.base,
          params: customParams || queryParams,
          tags: ["Category"],
        }).unwrap(),
        { errorMessage: "Failed to fetch categories.", ...options }
      ),

    // POST /categories/createcategories  (body can also be an array to create many)
    createCategory: (data: CategoryPayload | CategoryPayload[], options?: ApiHandlerOptions) =>
      exec(endpoints.categories.create, "POST", data, {
        successMessage: "Category created successfully.",
        errorMessage: "Failed to create category.",
        ...options,
      }),

    // PUT /categories/updatecategory/:id  - the backend only renames
    updateCategory: (id: string | number, categoryname: string, options?: ApiHandlerOptions) =>
      exec(endpoints.categories.update(id), "PUT", { categoryname }, {
        successMessage: "Category updated successfully.",
        errorMessage: "Failed to update category.",
        ...options,
      }),

    deleteCategory: (id: string | number, options?: ApiHandlerOptions) =>
      exec(endpoints.categories.delete(id), "DELETE", undefined, {
        successMessage: "Category deleted successfully.",
        errorMessage: "Failed to delete category.",
        ...options,
      }),

    reorderCategories: (orders: ReorderCategoryItem[], options?: ApiHandlerOptions) =>
      exec(endpoints.categories.reorder, "PUT", { orders }, {
        successMessage: "Categories reordered successfully.",
        errorMessage: "Failed to reorder categories.",
        ...options,
      }),

    addSubCategory: (id: string | number, subCategoryName: string, options?: ApiHandlerOptions) =>
      exec(endpoints.categories.addSub(id), "PUT", { subCategoryName }, {
        successMessage: "Sub-category added successfully.",
        errorMessage: "Failed to add sub-category.",
        ...options,
      }),

    updateSubCategory: (
      id: string | number,
      data: { oldSubCategoryName: string; newSubCategoryName: string },
      options?: ApiHandlerOptions
    ) =>
      exec(endpoints.categories.updateSub(id), "PUT", data, {
        successMessage: "Sub-category updated successfully.",
        errorMessage: "Failed to update sub-category.",
        ...options,
      }),

    removeSubCategory: (id: string | number, subCategoryName: string, options?: ApiHandlerOptions) =>
      exec(endpoints.categories.removeSub(id), "PUT", { subCategoryName }, {
        successMessage: "Sub-category removed successfully.",
        errorMessage: "Failed to remove sub-category.",
        ...options,
      }),
  };
};


// Read-only version for the storefront (navbar, shop filters, home tiles): one cached query and
// nothing else - no mutation / lazy-trigger subscriptions per component instance.
export const useCategories = () => {
  const q = useGetsQuery(QA.categories);
  return {
    categories: (q.data?.data || []) as any[],
    isLoadingCategories: q.isLoading,
  };
};
