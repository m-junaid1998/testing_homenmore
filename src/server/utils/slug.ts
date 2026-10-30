import Product from "../models/Product";
import { slugify } from "../../utils/seo";

/** A product URL name that no other product uses: "bridal-set", then "bridal-set-2", "bridal-set-3"... */
export const uniqueProductSlug = async (name: string) => {
  const base = slugify(name) || "product";
  for (let n = 1; n < 1000; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await Product.exists({ slug }))) return slug;
  }
  return `${base}-${Date.now()}`;
};
