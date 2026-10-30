import { endpoints } from "./config";
import type { GenericArg } from "./apiSlice";

/**
 * Single source of truth for the query arguments of every storefront GET.
 * Hooks (client) and pages (server prefetch) both import these, so a server-rendered response
 * lands under EXACTLY the cache key the hook later reads - no duplicate request on the client.
 */
export const QA = {
  categories: { endpoint: endpoints.categories.base, params: { isAllRecord: true }, tags: ["Category"] } as GenericArg,
  carousel: { endpoint: endpoints.mediaRoutes.getupload, params: { key: "carousel", type: "image", isAllRecord: true } } as GenericArg,
  reels: { endpoint: endpoints.mediaRoutes.getupload, params: { key: "reels" } } as GenericArg,
  newArrivals: {
    endpoint: endpoints.productRoutes.getAll,
    params: { isNewArrival: true, isAllRecord: true, sortOn: "latest", isPublished: true },
  } as GenericArg,
  bestSellers: (limit = 8): GenericArg => ({ endpoint: endpoints.productRoutes.bestSellers, params: { limit } }),
  topRated: (limit = 8): GenericArg => ({ endpoint: endpoints.productRoutes.topRated, params: { limit } }),
  categoryImages: endpoints.categoryimageRoutes.getAll,
  cart: { endpoint: endpoints.cartRoutes.base, tags: ["Cart"] } as GenericArg,
  wishlist: { endpoint: endpoints.wishlistRoutes.base, tags: ["Wishlist"] } as GenericArg,
  shipping: { endpoint: endpoints.settingsRoutes.shipping, tags: ["Settings"] } as GenericArg,
  product: (id: string) => endpoints.productRoutes.getById(id),
  related: (id: string) => endpoints.productRoutes.related(id),
  catalog: (params: Record<string, any>): GenericArg => ({ endpoint: endpoints.searchRoutes.catalog, params }),
};
