"use client";

import { useGetQuery } from "../api/apiSlice";
import { QA } from "../api/queryArgs";

// GET /search/catalog - the storefront listing (published products only)
export interface CatalogParams {
  currentPage?: number;
  pageSize?: number;
  searchString?: string;
  category?: string; // comma separated category ids
  subCategory?: string; // comma separated sub-category names
  minPrice?: number | string;
  maxPrice?: number | string;
  newArrival?: boolean;
  sortOn?: "createdAt" | "price" | "alpha-az" | "alpha-za";
  sortDirection?: "asc" | "desc";
}

export const useSearch = (params: CatalogParams, skip = false) => {
  const q = useGetQuery(QA.catalog(params as Record<string, any>), { skip });
  return {
    products: q.data?.data || [],
    resultsCount: q.data?.resultsCount || 0,
    totalPages: q.data?.totalPages || 1,
    currentPage: q.data?.currentPage || params.currentPage || 1,
    isLoadingSearch: q.isLoading,
    isFetchingSearch: q.isFetching,
  };
};
