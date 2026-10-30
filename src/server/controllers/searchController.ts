import Product from "../models/Product";
import asyncHandler from "../utils/asyncHandler";
import { formatProductResponse } from "../utils/productResponse";
import { cached, setHttpCache, NS } from "../utils/cache";
import { isObjectId, text, toInt } from "../utils/safe";
import { CARD_SELECT, WEEK_MS, searchFilter } from "../utils/productQuery";

const csv = (value: unknown) => text(value, 500).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20);

// Storefront listing (shop and category pages): published products only.
export const searchCatalog = asyncHandler(async (req, res) => {
  const q = req.query;
  const page = toInt(q.currentPage, 1);
  const limit = toInt(q.pageSize, 12, 1, 60);
  const dir = q.sortDirection === "asc" ? 1 : -1;

  const filter: Record<string, any> = { isPublished: true, ...searchFilter(text(q.searchString, 100)) };
  const categories = csv(q.category).filter(isObjectId);
  const subCategories = csv(q.subCategory);
  if (categories.length) filter.categoryname = { $in: categories };
  if (subCategories.length) filter.subCategory = { $in: subCategories };
  if (q.newArrival === "true") filter.createdAt = { $gte: new Date(Date.now() - WEEK_MS) };
  if (q.minPrice || q.maxPrice) {
    // the product's starting price or the price of any of its sizes
    const range = { ...(q.minPrice && { $gte: Number(q.minPrice) }), ...(q.maxPrice && { $lte: Number(q.maxPrice) }) };
    filter.$and = [{ $or: [{ salePrice: range }, { sizes: { $elemMatch: { salePrice: range } } }] }];
  }

  const sort: Record<string, 1 | -1> = q.sortOn === "price" ? { salePrice: dir } : q.sortOn === "alpha-az" ? { name: 1 } : q.sortOn === "alpha-za" ? { name: -1 } : { createdAt: dir };

  const payload = await cached(NS.products, { search: q }, async () => {
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).select(CARD_SELECT).populate("categoryname", "categoryname").sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    return { success: true, resultsCount: total, totalPages: Math.ceil(total / limit), currentPage: page, data: products.map(formatProductResponse) };
  });

  setHttpCache(req, res, 30);
  return res.status(200).json(payload);
});
