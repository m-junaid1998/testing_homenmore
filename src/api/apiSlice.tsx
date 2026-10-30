import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { endpoints } from "./config";
import { logoutState, setToken } from "@/redux/authSlice";
import type { RootState } from "@/redux/store";

export interface GenericArg {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: any;
  params?: Record<string, any>;
  tags?: string[]; // GET: tags the result is stored under; mutation: tags to refetch
}

const queryString = (params: GenericArg["params"] = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== "") as [string, string][]).toString();
  return query ? `?${query}` : "";
};
const tagsOf = (arg: GenericArg) => (arg.tags ?? []).map((type) => ({ type: type as any, id: "LIST" }));

// Cart, wishlist, orders and reviews work for guests too: they send their guest id instead of a login token.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/",
  prepareHeaders: (headers, { getState }) => {
    const { token, guestId } = (getState() as RootState).auth;
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (guestId) headers.set("x-guest-id", guestId);
    return headers;
  },
});

// A 401 for a logged-in user means the access token expired: get a new one (once, even for parallel calls) and retry.
let refreshing: Promise<{ data?: any }> | null = null;
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);
  const url = typeof args === "string" ? args : args.url;

  if (result.error?.status === 401 && (api.getState() as RootState).auth.user && !url.startsWith("auth/")) {
    refreshing ??= Promise.resolve(rawBaseQuery({ url: endpoints.auth.refresh, method: "POST" }, api, extra)).finally(() => (refreshing = null));
    const { data } = await refreshing;
    if (data?.accessToken) {
      api.dispatch(setToken(data.accessToken));
      result = await rawBaseQuery(args, api, extra);
    } else {
      api.dispatch(logoutState());
    }
  }
  return result;
};

// A plain object becomes multipart form data: files are appended as they are, everything else as JSON text.
const toFormData = (data: Record<string, any>) => {
  if (data instanceof FormData) return data;
  const form = new FormData();
  for (const [key, value] of Object.entries(data ?? {})) {
    if (value == null) continue;
    if (Array.isArray(value) && value.some((v) => v instanceof File)) value.forEach((file) => form.append(key, file));
    else if (typeof value === "object" && !(value instanceof File)) form.append(key, JSON.stringify(value));
    else form.append(key, value);
  }
  return form;
};

const mutation = (body: (data: any) => unknown) => ({
  query: ({ endpoint, method = "POST", data, params }: GenericArg) => ({ url: `${endpoint}${queryString(params)}`, method, body: body(data) }),
  invalidatesTags: (_result: unknown, _error: unknown, arg: GenericArg) => tagsOf(arg),
});

export const apiSlice = createApi({
  reducerPath: "api",
  // Cache first: data that is already cached (or was rendered on the server) is not fetched again on mount.
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  refetchOnReconnect: true,
  baseQuery,
  tagTypes: ["Category", "Auth", "User", "Product", "Cart", "Wishlist", "Order", "Settings"],
  endpoints: (builder) => ({
    gets: builder.query<any, GenericArg | string>({
      query: (arg) => (typeof arg === "string" ? arg : `${arg.endpoint}${queryString(arg.params)}`),
      providesTags: (_result, _error, arg) => (typeof arg === "string" ? [] : tagsOf(arg)),
    }),
    crud: builder.mutation<any, GenericArg>(mutation((data) => data)),
    upload: builder.mutation<any, GenericArg>(mutation(toFormData)),
  }),
});

export const { useGetsQuery, useLazyGetsQuery, useCrudMutation, useUploadMutation } = apiSlice;

// Short names used by the hooks and admin screens.
export const useGetQuery = useGetsQuery;
export const useLazyGetQuery = useLazyGetsQuery;
