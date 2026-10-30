import Product from "../models/Product";
import Category from "../models/Category";
import asyncHandler from "../utils/asyncHandler";
import { formatProductResponse } from "../utils/productResponse";
import { calculateDiscountPercentage, deriveBasePricing, normalizeSizes } from "../utils/sizes";
import { cached, invalidate, setHttpCache, NS } from "../utils/cache";
import { isObjectId, text, toInt } from "../utils/safe";
import { CARD_SELECT, WEEK_MS, searchFilter } from "../utils/productQuery";
import { uniqueProductSlug } from "../utils/slug";
import { fail, ok } from "../utils/respond";

const MAX_IMAGES = 6;
const SORTABLE = ["createdAt", "updatedAt", "salePrice", "regularPrice", "name", "ratings", "stock"];

/* ---------- reading the admin form (JSON strings and plain values both arrive) ---------- */
const bool = (v: unknown) => v === true || v === "true";
const money = (v: unknown) => Math.max(0, Number(v) || 0);
const list = (v: unknown): any[] => {
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Only the fields present in the request: the same reader serves create and update. Ratings, ids and dates are never read. */
const readFields = (b: any) => {
  const f: Record<string, any> = {};
  if ("name" in b) f.name = text(b.name, 150);
  if ("categoryname" in b) f.categoryname = b.categoryname;
  if ("subCategory" in b) f.subCategory = text(b.subCategory, 60) || "None";
  if ("description" in b) f.description = text(b.description, 5000);
  if ("stock" in b) f.stock = Math.floor(money(b.stock));
  if ("isPublished" in b) f.isPublished = bool(b.isPublished);
  if ("isBestSeller" in b) f.isBestSeller = bool(b.isBestSeller);
  if ("colors" in b) f.colors = list(b.colors).map((c) => text(c, 40)).filter(Boolean);
  if ("relatedProducts" in b) f.relatedProducts = list(b.relatedProducts).filter(isObjectId);
  if ("colorSwatches" in b) {
    f.colorSwatches = list(b.colorSwatches)
      .filter((c) => typeof c?.name === "string" && c.name.trim())
      .map((c) => ({ name: c.name.trim(), hex: /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex.toLowerCase() : "" }));
  }
  return f;
};

/** Sizes decide the price when there are any; otherwise the plain prices are used. */
const readPricing = (b: any, live?: any) => {
  const out: Record<string, any> = {};
  if ("sizes" in b) {
    const { sizes, error } = normalizeSizes(b.sizes);
    if (error) return { error };
    out.sizes = sizes;
  }
  const sizes = out.sizes ?? live?.sizes ?? [];
  if (sizes.length) {
    if (out.sizes) Object.assign(out, deriveBasePricing(sizes));
  } else if (!live || "regularPrice" in b || "salePrice" in b) {
    const regularPrice = money(b.regularPrice ?? live?.regularPrice);
    const salePrice = money(b.salePrice ?? live?.salePrice);
    Object.assign(out, { regularPrice, salePrice, discount: calculateDiscountPercentage(regularPrice, salePrice) });
  }
  return { pricing: out };
};

const withRelations = (query: any) => query.populate("categoryname", "categoryname").populate("relatedProducts", "name slug salePrice images");
const sendProduct = async (id: unknown) => formatProductResponse(await withRelations(Product.findById(id)).lean());

const categoryExists = (id: unknown) => isObjectId(id) && Category.exists({ _id: id });

/* ---------- admin ---------- */
export const createProduct = asyncHandler(async (req, res) => {
  const fields = readFields(req.body);
  const { pricing, error } = readPricing(req.body);
  if (!fields.name || !isObjectId(fields.categoryname)) return fail(res, 400, "Name and a valid category are required.");
  if (error) return fail(res, 400, error);
  if (!(await categoryExists(fields.categoryname))) return fail(res, 404, "Target category record not found.");

  const product = await Product.create({
    isPublished: true,
    ...fields,
    ...pricing,
    slug: await uniqueProductSlug(fields.name),
    images: req.files?.map((file) => file.path) ?? [],
  });
  await invalidate(NS.products);
  return ok(res, await sendProduct(product._id), undefined, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return fail(res, 400, "Invalid target ID.");
  const live = await Product.findById(id).select("images sizes regularPrice salePrice").lean();
  if (!live) return fail(res, 404, "Product entity missing.");

  const fields = readFields(req.body);
  const { pricing, error } = readPricing(req.body, live);
  if (error) return fail(res, 400, error);
  if (fields.categoryname !== undefined && !(await categoryExists(fields.categoryname))) return fail(res, 404, "Selected category not found.");

  // kept images (only ones this product already has) + new uploads; nothing sent = keep as is
  const kept = list(req.body.existingImages ?? req.body.images).filter((url) => live.images.includes(url));
  const images = [...kept, ...(req.files?.map((file) => file.path) ?? [])];
  if (images.length > MAX_IMAGES) return fail(res, 400, `A product can have at most ${MAX_IMAGES} images.`);

  await Product.updateOne({ _id: id }, { ...fields, ...pricing, images: images.length ? images : live.images }, { runValidators: true });
  await invalidate(NS.products);
  return ok(res, await sendProduct(id));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id) || !(await Product.findByIdAndDelete(req.params.id))) return fail(res, 404, "Product not found.");
  await invalidate(NS.products);
  return ok(res, undefined, "Product deleted successfully.");
});

export const deleteAllProducts = asyncHandler(async (_req, res) => {
  const { deletedCount } = await Product.deleteMany({});
  await invalidate(NS.products);
  return res.status(200).json({ success: true, message: "All products deleted successfully.", deletedCount });
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const ids = [req.body.id].flat().filter(isObjectId);
  const found = await Product.find({ _id: { $in: ids } }).select("isPublished").lean();
  if (!found.length) return fail(res, 404, "Target products not found.");

  await Product.updateMany({ _id: { $in: found.map((p) => p._id) } }, [{ $set: { isPublished: { $not: "$isPublished" } } }]);
  await invalidate(NS.products);
  const message = found.length === 1 ? `Product ${found[0].isPublished ? "Drafted" : "Published"} successfully.` : `${found.length} products status updated successfully.`;
  return res.status(200).json({ success: true, message, count: found.length });
});

/* ---------- public (admins also see drafts) ---------- */
export const getProducts = asyncHandler(async (req, res) => {
  const q = req.query;
  const isAdmin = req.user?.role === "admin";
  const all = q.isAllRecord === "true";
  const page = toInt(q.currentPage, 1);
  const limit = toInt(q.pageSize, 10, 1, 100);
  const dir = q.sortDirection === "asc" ? 1 : -1;

  const filter: Record<string, any> = searchFilter(text(q.searchString, 100));
  if (!isAdmin) filter.isPublished = true;
  else if (q.isPublished !== undefined) filter.isPublished = q.isPublished === "true";
  if (q.isBestSeller !== undefined) filter.isBestSeller = q.isBestSeller === "true";
  if (q.discountFilter === "hasDiscount") filter.discount = { $ne: "0%" };
  if (q.isNewArrival === "true") filter.createdAt = { $gte: new Date(Date.now() - WEEK_MS) };
  else if (q.fromDate || q.toDate) filter.createdAt = { ...(q.fromDate && { $gte: new Date(q.fromDate) }), ...(q.toDate && { $lte: new Date(q.toDate) }) };

  const sort: Record<string, 1 | -1> =
    q.sortOn === "price" ? { salePrice: dir } : q.sortOn === "latest" ? { createdAt: -1 } : { [SORTABLE.includes(q.sortOn) ? q.sortOn : "createdAt"]: dir };

  const payload = await cached(NS.products, { list: q, isAdmin }, async () => {
    let query = Product.find(filter).populate("categoryname", "categoryname").sort(sort);
    query = q.fields === "full" ? query.populate("relatedProducts", "name salePrice images") : query.select(CARD_SELECT);
    if (!all) query = query.skip((page - 1) * limit).limit(limit);
    const [totalCount, products] = await Promise.all([Product.countDocuments(filter), query.lean()]);
    return {
      success: true,
      pagination: { totalCount, totalPages: all ? 1 : Math.ceil(totalCount / limit), currentPage: all ? 1 : page, pageSize: all ? totalCount : limit, isAllRecord: all },
      data: products.map(formatProductResponse),
    };
  });

  setHttpCache(req, res);
  return res.status(200).json(payload);
});

// The page URL is the slug; an id (old links, cart, orders) works too and the page redirects it to the slug.
export const getProductById = asyncHandler(async (req, res) => {
  const param = text(req.params.id, 120);
  const query = isObjectId(param) ? { _id: param } : { slug: param.toLowerCase() };

  const product: any = await cached(NS.products, { detail: param }, async () => {
    const found: any = await withRelations(Product.findOne(query)).lean();
    if (found && !found.slug) {
      // products created before slugs existed get theirs the first time they are opened
      found.slug = await uniqueProductSlug(found.name);
      await Product.updateOne({ _id: found._id }, { $set: { slug: found.slug } });
    }
    return found && formatProductResponse(found);
  });

  if (!product || (product.isPublished === false && req.user?.role !== "admin")) return fail(res, 404, "Product record missing.");
  setHttpCache(req, res);
  return ok(res, product);
});

const featured = (filter: Record<string, unknown>, sort: Record<string, 1 | -1>) =>
  asyncHandler(async (req, res) => {
    const limit = toInt(req.query.limit, 10, 1, 50);
    const payload = await cached(NS.products, { featured: filter, limit }, async () => {
      const products = await Product.find({ isPublished: true, ...filter }).select(CARD_SELECT).sort(sort).limit(limit).populate("categoryname", "categoryname").lean();
      return { success: true, count: products.length, data: products.map(formatProductResponse) };
    });
    setHttpCache(req, res);
    return res.status(200).json(payload);
  });

export const getTopRatedProducts = featured({ ratings: { $gte: 4 } }, { ratings: -1, numReviews: -1 });
export const getBestSellerProducts = featured({ isBestSeller: true }, { createdAt: -1 });

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) return fail(res, 400, "Invalid Product ID.");

  const payload = await cached(NS.products, { related: id }, async () => {
    const product = await Product.findById(id).select("categoryname relatedProducts").lean();
    if (!product) return null;
    // products the admin picked by hand, otherwise the best rated in the same category
    const manual = product.relatedProducts?.length ? { _id: { $in: product.relatedProducts } } : { categoryname: product.categoryname, _id: { $ne: id } };
    const related = await Product.find({ isPublished: true, ...manual }).select(CARD_SELECT).sort({ ratings: -1, createdAt: -1 }).limit(8).populate("categoryname", "categoryname").lean();
    return { success: true, data: related.map(formatProductResponse) };
  });

  if (!payload) return fail(res, 404, "Product not found.");
  setHttpCache(req, res);
  return res.status(200).json(payload);
});

