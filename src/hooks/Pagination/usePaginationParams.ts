"use client";

import { useState, useCallback, useMemo } from "react";

// Mirrors the backend's pagination block: { totalCount, totalPages, currentPage, pageSize, ... }
export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Query-string names are the ones the backend reads (currentPage / pageSize / searchString ...).
export interface PaginationParams {
  currentPage?: number;
  pageSize?: number;
  sortOn?: string;
  sortDirection?: "asc" | "desc";
  searchString?: string;
  isAllRecord?: boolean;
  fromDate?: string;
  toDate?: string;
  isNewArrival?: boolean;
  isPublished?: boolean | string;
  isBestSeller?: boolean | string;
  discountFilter?: string;
  fields?: string;
  status?: string;
  dateRange?: string;
}

const defaultParams: PaginationParams = {
  currentPage: 1,
  pageSize: 10,
  sortOn: "createdAt",
  sortDirection: "desc",
  searchString: "",
  isAllRecord: false,
};

export const usePaginationParams = (initial: PaginationParams = {}) => {
  const initialKey = JSON.stringify(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialParams = useMemo(() => ({ ...defaultParams, ...initial }), [initialKey]);

  const [params, setParams] = useState<PaginationParams>(initialParams);

  const updateParams = useCallback((newParams: Partial<PaginationParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const handleSearch = useCallback(
    (searchString: string) => updateParams({ searchString, currentPage: 1 }),
    [updateParams]
  );

  const setPage = useCallback(
    (page: number) => updateParams({ currentPage: Math.max(1, page) }),
    [updateParams]
  );

  const setLimit = useCallback(
    (pageSize: number) => updateParams({ pageSize, currentPage: 1 }),
    [updateParams]
  );

  const resetParams = useCallback(() => setParams(initialParams), [initialParams]);

  const getMeta = useCallback(
    (backendMeta?: Partial<PaginationMeta>): PaginationMeta => ({
      currentPage: backendMeta?.currentPage ?? params.currentPage ?? 1,
      pageSize: backendMeta?.pageSize ?? params.pageSize ?? 10,
      totalCount: backendMeta?.totalCount ?? 0,
      totalPages: backendMeta?.totalPages ?? 1,
    }),
    [params.currentPage, params.pageSize]
  );

  return { params, setParams, updateParams, handleSearch, setPage, setLimit, resetParams, getMeta };
};
