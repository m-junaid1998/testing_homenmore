export const SORTS = [
  { label: "Newest", sortOn: "createdAt", sortDirection: "desc" },
  { label: "Price: Low to High", sortOn: "price", sortDirection: "asc" },
  { label: "Price: High to Low", sortOn: "price", sortDirection: "desc" },
  { label: "Name: A to Z", sortOn: "alpha-az", sortDirection: "asc" },
  { label: "Name: Z to A", sortOn: "alpha-za", sortDirection: "desc" },
] as const;

export const CATALOG_PAGE_SIZE = 40;

type Getter = (key: string) => string | null | undefined;

/**
 * Shop / category listing -> /api/search/catalog params.
 * Used by BOTH the server page (prefetch) and the client Shop screen, so they hit the same cache key.
 */
export function buildCatalogParams(get: Getter, categoryId?: string) {
  const sort = SORTS[Number(get("sort") || "0")] || SORTS[0];
  return {
    currentPage: 1,
    pageSize: CATALOG_PAGE_SIZE,
    searchString: get("q") || "",
    category: categoryId ?? (get("category") || ""),
    subCategory: get("sub") || get("subCategory") || "",
    minPrice: get("minPrice") || undefined,
    maxPrice: get("maxPrice") || undefined,
    newArrival: get("newArrival") === "true" ? true : undefined,
    sortOn: sort.sortOn,
    sortDirection: sort.sortDirection,
  };
}

/** Next.js `searchParams` (string | string[]) -> Getter */
export const fromSearchParams =
  (sp: Record<string, string | string[] | undefined>): Getter =>
  (key) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
