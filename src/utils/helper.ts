export const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const validateEmptyObject = <T extends Record<string, any>>( obj: T): T =>
Object.fromEntries( Object.entries(obj).filter( ([, value]) =>
value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "") )) as T;

export const calculateDiscount = (regular: number | string, sale: number | string): string => {
  const r = Number(regular) || 0;
  const s = Number(sale) || 0;
  return r > 0 && s < r ? `${Math.round(((r - s) / r) * 100)}%` : "0%";
};

export const formatPKR = (n: number | undefined | null) => `PKR ${(n || 0).toLocaleString()}`;

// Product price for a chosen size label (falls back to the base price).
export const priceForSize = (product: any, size?: string) => {
  const match = size && product?.sizes?.find((s: any) => s.label?.toLowerCase() === size.toLowerCase());
  return {
    salePrice: match ? match.salePrice : product?.salePrice ?? 0,
    regularPrice: match ? match.regularPrice : product?.regularPrice ?? 0,
  };
};
