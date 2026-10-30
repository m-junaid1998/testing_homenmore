/**
 * Route table: every API URL and who may call it. First match wins, so fixed paths are listed before ":param" ones.
 *
 * guards: auth = logged in, admin = admin only (always after auth), optionalAuth = token optional,
 *         identity = logged in OR guest id, *Limit = per-IP rate limit
 */
import type { Handler } from "./types";
import type { UploadSpec } from "./upload";
import * as auth from "./controllers/authController";
import * as products from "./controllers/productController";
import * as categories from "./controllers/categoryController";
import * as categoryImages from "./controllers/categoryImageController";
import * as cart from "./controllers/cartController";
import * as wishlist from "./controllers/wishlistController";
import * as orders from "./controllers/orderController";
import * as customers from "./controllers/customerController";
import * as dashboard from "./controllers/dashboardController";
import * as reviews from "./controllers/reviewController";
import * as contacts from "./controllers/contactController";
import * as media from "./controllers/mediaController";
import * as search from "./controllers/searchController";
import * as settings from "./controllers/settingsController";

export type Guard = "auth" | "admin" | "optionalAuth" | "identity" | "loginLimit" | "formLimit" | "guestLimit";
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RouteConfig {
  method: Method;
  pattern: string;
  guards: Guard[];
  handler: Handler;
  upload?: UploadSpec;
  noDatabase?: boolean;
}

const ADMIN: Guard[] = ["auth", "admin"];
const SHOPPER: Guard[] = ["identity"];

const table: RouteConfig[] = [
  // auth
  { method: "POST", pattern: "/auth/register", guards: ["loginLimit"], handler: auth.registerUser },
  { method: "POST", pattern: "/auth/login", guards: ["loginLimit"], handler: auth.loginUser },
  { method: "POST", pattern: "/auth/google", guards: ["loginLimit"], handler: auth.googleLogin },
  { method: "POST", pattern: "/auth/refresh-token", guards: ["loginLimit"], handler: auth.refreshAccessToken },
  { method: "POST", pattern: "/auth/logout", guards: [], handler: auth.logoutUser },
  { method: "GET", pattern: "/auth/guest", guards: ["guestLimit"], handler: auth.getGuestId, noDatabase: true },
  { method: "PUT", pattern: "/auth/update-password", guards: ["auth", "loginLimit"], handler: auth.updatePassword },
  { method: "DELETE", pattern: "/auth/delete-user", guards: ADMIN, handler: auth.deleteUserByEmail },

  // products
  { method: "GET", pattern: "/products/top-rated", guards: [], handler: products.getTopRatedProducts },
  { method: "GET", pattern: "/products/best-sellers", guards: [], handler: products.getBestSellerProducts },
  { method: "GET", pattern: "/products/related/:id", guards: [], handler: products.getRelatedProducts },
  { method: "GET", pattern: "/products/allproducts", guards: ["optionalAuth"], handler: products.getProducts },
  { method: "GET", pattern: "/products/product/:id", guards: ["optionalAuth"], handler: products.getProductById },
  { method: "POST", pattern: "/products/createproduct", guards: ADMIN, handler: products.createProduct, upload: { field: "images", profile: "products", max: 6 } },
  { method: "PUT", pattern: "/products/updateproduct/:id", guards: ADMIN, handler: products.updateProduct, upload: { field: "images", profile: "products", max: 6 } },
  { method: "PATCH", pattern: "/products/toggle-publish", guards: ADMIN, handler: products.togglePublishStatus },
  { method: "DELETE", pattern: "/products/deleteproduct/:id", guards: ADMIN, handler: products.deleteProduct },
  { method: "DELETE", pattern: "/products/delete-all", guards: ADMIN, handler: products.deleteAllProducts },

  // dashboard / customers
  { method: "GET", pattern: "/dashboard/overview", guards: ADMIN, handler: dashboard.getDashboardOverview },
  { method: "GET", pattern: "/customers/dashboard", guards: ADMIN, handler: customers.getDashboardCustomers },

  // categories
  { method: "GET", pattern: "/categories/allcategories", guards: [], handler: categories.getCategories },
  { method: "PUT", pattern: "/categories/reorder", guards: ADMIN, handler: categories.reorderCategories },
  { method: "POST", pattern: "/categories/createcategories", guards: ADMIN, handler: categories.createCategory },
  { method: "PUT", pattern: "/categories/updatecategory/:id", guards: ADMIN, handler: categories.updateCategory },
  { method: "DELETE", pattern: "/categories/deletecategory/:id", guards: ADMIN, handler: categories.deleteCategory },
  { method: "PUT", pattern: "/categories/subcategory/add/:id", guards: ADMIN, handler: categories.addSubCategory },
  { method: "PUT", pattern: "/categories/subcategory/update/:id", guards: ADMIN, handler: categories.updateSubCategory },
  { method: "PUT", pattern: "/categories/subcategory/remove/:id", guards: ADMIN, handler: categories.deleteSubCategory },

  // category images
  { method: "GET", pattern: "/categoryimages/categories-list", guards: [], handler: categoryImages.getCategoriesList },
  { method: "GET", pattern: "/categoryimages", guards: [], handler: categoryImages.getAllCategoryImages },
  { method: "POST", pattern: "/categoryimages/upload", guards: ADMIN, handler: categoryImages.uploadCategoryImage, upload: { field: "image", profile: "subcategories", single: true } },
  { method: "PUT", pattern: "/categoryimages/:id", guards: ADMIN, handler: categoryImages.updateCategoryImage, upload: { field: "image", profile: "subcategories", single: true } },
  { method: "DELETE", pattern: "/categoryimages/:id", guards: ADMIN, handler: categoryImages.deleteCategoryImage },

  // cart and wishlist (logged-in user OR guest)
  { method: "POST", pattern: "/cart", guards: SHOPPER, handler: cart.addToCart },
  { method: "GET", pattern: "/cart", guards: SHOPPER, handler: cart.getCart },
  { method: "DELETE", pattern: "/cart", guards: SHOPPER, handler: cart.clearCart },
  { method: "DELETE", pattern: "/cart/:productId", guards: SHOPPER, handler: cart.removeFromCart },
  { method: "POST", pattern: "/wishlist", guards: SHOPPER, handler: wishlist.toggleWishlist },
  { method: "GET", pattern: "/wishlist", guards: SHOPPER, handler: wishlist.getWishlist },

  // orders
  { method: "POST", pattern: "/orders/create", guards: ["formLimit", "identity"], handler: orders.addOrderItems },
  { method: "GET", pattern: "/orders/myorders", guards: SHOPPER, handler: orders.getMyOrders },
  { method: "GET", pattern: "/orders/dashboard", guards: ADMIN, handler: orders.getDashboardOrders },
  { method: "PATCH", pattern: "/orders/:id/status", guards: ADMIN, handler: orders.updateOrderStatus },
  { method: "DELETE", pattern: "/orders/delete-all", guards: ADMIN, handler: orders.deleteAllOrders },
  { method: "GET", pattern: "/orders/:id", guards: SHOPPER, handler: orders.getOrderById },

  // reviews
  { method: "GET", pattern: "/reviews/:productId", guards: ["optionalAuth"], handler: reviews.getProductReviews },
  { method: "POST", pattern: "/reviews/:productId", guards: ["formLimit", "identity"], handler: reviews.createProductReview, upload: { field: "photos", profile: "reviews", max: 4 } },
  { method: "DELETE", pattern: "/reviews/delete/:id", guards: SHOPPER, handler: reviews.deleteReview },
  { method: "DELETE", pattern: "/reviews/admin/delete/:id", guards: ADMIN, handler: reviews.deleteReview },

  // contact form
  { method: "POST", pattern: "/contacts/submit", guards: ["formLimit"], handler: contacts.submitContactQuery },
  { method: "GET", pattern: "/contacts/dashboard", guards: ADMIN, handler: contacts.getDashboardQueries },
  { method: "PATCH", pattern: "/contacts/:id/status", guards: ADMIN, handler: contacts.updateQueryStatus },
  { method: "DELETE", pattern: "/contacts/:id", guards: ADMIN, handler: contacts.deleteQuery },

  // media (carousel / reels)
  { method: "GET", pattern: "/media", guards: [], handler: media.getAllMedia },
  { method: "POST", pattern: "/media/upload", guards: ADMIN, handler: media.uploadMedia, upload: { field: "media", profile: "media", max: 10 } },
  { method: "DELETE", pattern: "/media/:id", guards: ADMIN, handler: media.deleteMedia },

  // shop settings (delivery charge, free-delivery amount)
  { method: "GET", pattern: "/settings/shipping", guards: [], handler: settings.getShippingSettings },
  { method: "PUT", pattern: "/settings/shipping", guards: ADMIN, handler: settings.updateShippingSettings },

  // storefront search
  { method: "GET", pattern: "/search/catalog", guards: [], handler: search.searchCatalog },
];

const compile = (pattern: string) => {
  const names: string[] = [];
  const source = pattern
    .split("/")
    .map((part) => (part.startsWith(":") ? (names.push(part.slice(1)), "([^/]+)") : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");
  return { regex: new RegExp(`^${source}/?$`), names };
};

export const routes = table.map((route) => ({ ...route, ...compile(route.pattern) }));

export function matchRoute(method: string, path: string) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.regex.exec(path);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.names.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
    return { route, params };
  }
  return null;
}
