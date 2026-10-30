"use client";

import { useIdentity } from "./useIdentity";
import { useGetQuery, useLazyGetQuery, useCrudMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";
import type { PaginationParams } from "./Pagination/usePaginationParams";

export interface OrderFilterParams extends PaginationParams {
  status?: string;
  dateRange?: string;
  search?: string;
}

export const useOrder = (params?: OrderFilterParams) => {
  const { isIdentityReady } = useIdentity();
  const [crudMutation, { isLoading: isCrudLoading }] = useCrudMutation();
  const [triggerGetOrderById, { isLoading: isSingleOrderLoading }] = useLazyGetQuery();
  const [triggerGetDashboardOrders, { isLoading: isDashboardOrdersLazyLoading }] = useLazyGetQuery();
  const { handleApiCall } = useApiHandler();

  const isOrderMutationLoading = isCrudLoading;

  const dashboardQueryResult = useGetQuery(
    { endpoint: endpoints.orderRoutes.dashboardOrders, params },
    { skip: !params }
  );

  const myOrdersQueryResult = useGetQuery(
    { endpoint: endpoints.orderRoutes.myOrders, tags: ["Order"] },
    { skip: !isIdentityReady }
  );

  const { refetch: refetchDashboard } = dashboardQueryResult;
  const { refetch: refetchMyOrders } = myOrdersQueryResult;

  const exec = async (
    endpoint: string,
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    data?: any,
    options?: ApiHandlerOptions
  ) => {
    const res = await handleApiCall(
      crudMutation({ endpoint, method, data, tags: ["Order"] }).unwrap(),
      options
    );

    if (res?.success && params) refetchDashboard();
    return res;
  };

  return {

    dashboardQueryResult,
    myOrdersQueryResult,

    dashboardOrders: dashboardQueryResult.data?.data || [],
    dashboardStats: dashboardQueryResult.data?.stats || null,
    dashboardPagination: dashboardQueryResult.data?.pagination || null,
    myOrders: myOrdersQueryResult.data?.data || [],

    isLoadingDashboardOrders: dashboardQueryResult.isLoading,
    isLoadingMyOrders: myOrdersQueryResult.isLoading,
    isOrderMutationLoading,
    isSingleOrderLoading,
    isDashboardOrdersLazyLoading,

    refetchDashboardOrders: refetchDashboard,
    refetchMyOrders,

    getDashboardOrders: (customParams?: OrderFilterParams, options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetDashboardOrders({
          endpoint: endpoints.orderRoutes.dashboardOrders,
          params: customParams || params,
        }).unwrap(),
        { errorMessage: "Failed to fetch dashboard orders.", ...options }
      ),

    getOrderById: (id: string | number, options?: ApiHandlerOptions) =>
      handleApiCall(
        triggerGetOrderById({
          endpoint: endpoints.orderRoutes.getById(id),
        }).unwrap(),
        { errorMessage: "Failed to fetch order details.", ...options }
      ),

    createOrder: (data: Record<string, any>, options?: ApiHandlerOptions) =>
      exec(endpoints.orderRoutes.create, "POST", data, {
        successMessage: "Order placed successfully.",
        errorMessage: "Failed to place order.",
        ...options,
      }),

    updateOrderStatus: (id: string | number, status: string, options?: ApiHandlerOptions) =>
      exec(endpoints.orderRoutes.updateStatus(id), "PATCH", { status }, {
        successMessage: `Order status updated to ${status}.`,
        errorMessage: "Failed to update order status.",
        ...options,
      }),

    deleteAllOrders: (options?: ApiHandlerOptions) =>
      exec(endpoints.orderRoutes.delete, "DELETE", undefined, {
        successMessage: "All orders deleted successfully.",
        errorMessage: "Failed to delete orders.",
        ...options,
      }),
  };
};