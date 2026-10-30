export const endpoints = {
  auth: {
    register: "auth/register",
    login: "auth/login",
    google: "auth/google",
    refresh: "auth/refresh-token",
    logout: "auth/logout",
    guest: "auth/guest",
    changePassword: "auth/update-password", 
  },

  categories: {
    base: "categories/allcategories", 
    create: "categories/createcategories", 
    update: (id: string | number) => `categories/updatecategory/${id}`, 
    delete: (id: string | number) => `categories/deletecategory/${id}`, 
    reorder: "categories/reorder", 
    addSub: (id: string | number) => `categories/subcategory/add/${id}`,
    updateSub: (id: string | number) => `categories/subcategory/update/${id}`, 
    removeSub: (id: string | number) => `categories/subcategory/remove/${id}`, 
  },

  categoryimageRoutes: {
    getCategoriesList: "categoryimages/categories-list",
    getAll: "categoryimages",
    upload: "categoryimages/upload",
    updateCategoryImage: (id: string | number) => `categoryimages/${id}`,
    delete: (id: string | number) => `categoryimages/${id}`,
  },

  productRoutes: {
    getAll: "products/allproducts",
    getById: (id: string | number) => `products/product/${id}`,
    topRated: "products/top-rated",
    bestSellers: "products/best-sellers",
    related: (id: string | number) => `products/related/${id}`,
    create: "products/createproduct",
    update: (id: string | number) => `products/updateproduct/${id}`,
    patch: "products/toggle-publish",
    delete: (id: string | number) => `products/deleteproduct/${id}`,
    deleteAll: "products/delete-all",
  },

  settingsRoutes: {
    shipping: "settings/shipping",
  },

  searchRoutes: {
    catalog: "search/catalog",
  },

  cartRoutes: {
    base: "cart",
    removeProduct: (id: string | number) => `cart/${id}`, // DELETE (?size=&color= optional)
  },

  wishlistRoutes: {
    base: "wishlist",
  },

  orderRoutes: {
    create: "orders/create",
    myOrders: "orders/myorders",
    dashboardOrders: "orders/dashboard",
    getById: (id: string | number) => `orders/${id}`,
    updateStatus: (id: string | number) => `orders/${id}/status`,
    delete: "orders/delete-all",
  },

  reviewRoutes: {
    getByProduct: (id: string | number) => `reviews/${id}`,
    create: (id: string | number) => `reviews/${id}`,
    deleteByUser: (id: string | number) => `reviews/delete/${id}`,
    deleteByAdmin: (id: string | number) => `reviews/admin/delete/${id}`,
  },

  contactRoutes: {
    submit: "contacts/submit",
    dashboardQueries: "contacts/dashboard",
    updateStatus: (id: string | number) => `contacts/${id}/status`,
    delete: (id: string | number) => `contacts/${id}`,
  },

  customerRoutes: {
    dashboardCustomers: "customers/dashboard",
  },

  dashboardRoutes: {
    overview: "dashboard/overview",
  },

  mediaRoutes: {
    getupload: "media",
    createupload: "media/upload",
    deleteupload: (id: string | number) => `media/${id}`,
  },
};
