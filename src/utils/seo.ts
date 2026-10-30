export const SITE_URL = "https://bambotia.com";
export const SITE_NAME = "BAMBOTIA";

export const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Product page URL: /product/gold-plated-bridal-set (the slug is made from the product name when the product is created). */
export const productPath = (p: { _id: string; slug?: string }) => `/product/${p.slug || p._id}`;

export const categoryPath = (name: string) => `/category/${slugify(name)}`;

export const stripHtml = (value: string) => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const truncate = (value: string, max = 155) => {
  const text = stripHtml(value);
  return text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
};

/** Cloudinary delivers a right-sized, modern-format (AVIF/WebP) copy: far smaller than the stored original. */
export const cloudinaryUrl = (src: string, width: number, quality: "auto" | "auto:good" | "auto:eco" = "auto:good") => {
  if (!src || !src.includes("res.cloudinary.com") || !src.includes("/upload/")) return src;
  if (/\/upload\/[^/]*(f_auto|w_\d+)/.test(src)) return src; // already transformed
  return src.replace("/upload/", `/upload/f_auto,q_${quality},w_${Math.round(width)},c_limit/`);
};

/** Swatch colour for a product colour: the hex the admin picked, else the colour name itself (CSS understands "red", "gold"...). */
export const colorHex = (product: { colorSwatches?: { name: string; hex?: string }[] }, name: string) =>
  product.colorSwatches?.find((c) => c.name === name)?.hex || name.toLowerCase().replace(/\s+/g, "");
