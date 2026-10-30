/**
 * Product "sizes": every size has its own regular and sale price.
 *   sizes: [{ label: "Small", regularPrice: 500, salePrice: 400, discount: "20%" }, ...]
 * The product's top-level regularPrice / salePrice / discount always mirror the CHEAPEST size,
 * so sorting, price filters and cards keep working. A product without sizes has one price.
 */

interface Size {
  label: string;
  regularPrice: number;
  salePrice: number;
  discount?: string;
}

export const calculateDiscountPercentage = (regular: number, sale: number) =>
  regular > 0 && sale < regular ? `${Math.round(((regular - sale) / regular) * 100)}%` : "0%";

const parseSizesInput = (raw: unknown): any[] | null => {
  if (raw === undefined || raw === null || raw === "") return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return null; // malformed JSON
    }
  }
  return null;
};

// Returns { sizes } on success or { error } with a message that is safe to show to the admin.
export const normalizeSizes = (raw: unknown): { sizes: Size[]; error?: string } => {
  const list = parseSizesInput(raw);
  if (list === null) return { sizes: [], error: "Sizes must be a valid list." };
  if (list.length > 20) return { sizes: [], error: "A product can have at most 20 sizes." };

  const seen = new Set<string>();
  const sizes: Size[] = [];

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i] || {};
    const label = String(item.label ?? item.name ?? "").trim();
    const regularPrice = Number(item.regularPrice);
    const salePrice = Number(item.salePrice);

    if (!label && !item.regularPrice && !item.salePrice) continue; // a blank row the admin left empty

    if (!label) return { sizes: [], error: `Size #${i + 1}: name is required.` };
    if (label.length > 40) return { sizes: [], error: `Size "${label}": name is too long (max 40 characters).` };
    if (!Number.isFinite(regularPrice) || regularPrice < 0) return { sizes: [], error: `Size "${label}": enter a valid regular price.` };
    if (!Number.isFinite(salePrice) || salePrice < 0) return { sizes: [], error: `Size "${label}": enter a valid sale price.` };
    if (salePrice > regularPrice) return { sizes: [], error: `Size "${label}": sale price cannot be higher than regular price.` };
    if (seen.has(label.toLowerCase())) return { sizes: [], error: `Size "${label}" is added twice.` };
    seen.add(label.toLowerCase());

    sizes.push({ label, regularPrice, salePrice, discount: calculateDiscountPercentage(regularPrice, salePrice) });
  }
  return { sizes };
};

// Base pricing (regularPrice / salePrice / discount) taken from the cheapest size.
export const deriveBasePricing = (sizes: Size[]) => {
  const cheapest = sizes.reduce((min, s) => (s.salePrice < min.salePrice ? s : min), sizes[0]);
  return {
    regularPrice: cheapest.regularPrice,
    salePrice: cheapest.salePrice,
    discount: calculateDiscountPercentage(cheapest.regularPrice, cheapest.salePrice),
  };
};

export const hasSizes = (product: any): boolean => Array.isArray(product?.sizes) && product.sizes.length > 0;

export const findSize = (product: any, label: unknown): Size | null => {
  if (!hasSizes(product) || !label) return null;
  const wanted = String(label).trim().toLowerCase();
  return product.sizes.find((s: Size) => String(s.label).trim().toLowerCase() === wanted) || null;
};

/** Price of ONE unit for the chosen size. Prices always come from the database, never from the browser. */
export const resolveUnitPricing = (
  product: any,
  label: unknown
): { ok: true; size: string; price: number; regularPrice: number; message?: undefined } | { ok: false; message: string; size?: undefined; price?: undefined; regularPrice?: undefined } => {
  if (!hasSizes(product)) return { ok: true, size: "", price: product.salePrice, regularPrice: product.regularPrice };
  if (!label || !String(label).trim()) return { ok: false, message: `Please select a size for "${product.name}".` };

  const match = findSize(product, label);
  if (!match) return { ok: false, message: `The selected size is no longer available for "${product.name}".` };
  return { ok: true, size: match.label, price: match.salePrice, regularPrice: match.regularPrice };
};
