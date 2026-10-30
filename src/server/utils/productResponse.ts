export const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

// Adds a computed `isNewArrival` flag to a (lean) product object and drops the legacy `dimensions` field.
export const formatProductResponse = (product: any) => {
  if (!product) return null;
  const rest = { ...product };
  delete rest.dimensions;
  const isNew = product.createdAt ? Date.now() - new Date(product.createdAt).getTime() < SEVEN_DAYS_IN_MS : false;
  return { ...rest, sizes: Array.isArray(rest.sizes) ? rest.sizes : [], isNewArrival: isNew };
};
