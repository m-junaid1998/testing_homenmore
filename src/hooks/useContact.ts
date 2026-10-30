"use client";

import { useGetQuery, useLazyGetQuery, useCrudMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";
import type { PaginationParams } from "./Pagination/usePaginationParams";

export interface ContactFilters extends PaginationParams {
  status?: string;
  dateRange?: string;
  search?: string;
}

export const useContact = (params?: ContactFilters) => {
  const [crudMutation, { isLoading: isContactMutationLoading }] = useCrudMutation();
  const [triggerGetQueries, { isLoading: isContactLazyLoading }] = useLazyGetQuery();
  const { handleApiCall } = useApiHandler();

  const queryResult = useGetQuery(
    { endpoint: endpoints.contactRoutes.dashboardQueries, params },
    { skip: !params }
  );

  const exec = async (
    endpoint: string,
    method: "POST" | "PATCH" | "DELETE",
    data?: any,
    options?: ApiHandlerOptions
  ) => {
    const res = await handleApiCall(
      crudMutation({ endpoint, method, data }).unwrap(),
      options
    );
    if (res?.success && params) queryResult.refetch(); // refetch() throws on a skipped query
    return res;
  };

  return {
    contactQuery: queryResult,
    queries: queryResult.data?.data || [],
    stats: queryResult.data?.stats || {
      totalMessages: 0,
      pendingMessages: 0,
      inProgressMessages: 0,
      resolvedMessages: 0,
    },
    pagination: queryResult.data?.pagination || null,
    isLoadingContacts: queryResult.isLoading,
    isContactMutationLoading,
    isContactLazyLoading,
    refetchContacts: queryResult.refetch,

    submitContactQuery: (
      data: { name: string; email: string; message: string },
      opts?: ApiHandlerOptions
    ) =>
      exec(endpoints.contactRoutes.submit, "POST", data, {
        successMessage: "Message submitted successfully.",
        errorMessage: "Failed to submit.",
        ...opts,
      }),

    getDashboardQueries: (
      customParams?: ContactFilters,
      opts?: ApiHandlerOptions
    ) =>
      handleApiCall(
        triggerGetQueries({
          endpoint: endpoints.contactRoutes.dashboardQueries,
          params: customParams || params,
        }).unwrap(),
        opts
      ),

    updateQueryStatus: (
      id: string | number,
      payload: { status?: string; adminNotes?: string },
      opts?: ApiHandlerOptions
    ) =>
      exec(endpoints.contactRoutes.updateStatus(id), "PATCH", payload, {
        successMessage: "Status updated successfully.",
        errorMessage: "Failed to update.",
        ...opts,
      }),

    deleteQuery: (id: string | number, opts?: ApiHandlerOptions) =>
      exec(endpoints.contactRoutes.delete(id), "DELETE", undefined, {
        successMessage: "Query deleted successfully.",
        errorMessage: "Failed to delete.",
        ...opts,
      }),
  };
};