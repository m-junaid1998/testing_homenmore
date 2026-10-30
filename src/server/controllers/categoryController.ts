import Category from "../models/Category";
import asyncHandler from "../utils/asyncHandler";
import { getPaginatedData } from "../utils/paginationHelper";
import { escapeRegex, isObjectId, text, toInt } from "../utils/safe";
import { cached, invalidate, setHttpCache, NS } from "../utils/cache";
import { fail, ok } from "../utils/respond";

// Categories feed product payloads (name), so any change also clears the product and category-image caches.
const changed = () => invalidate(NS.categories, NS.categoryImages, NS.products);
const exactly = (name: string) => ({ $regex: `^${escapeRegex(name)}$`, $options: "i" });

export const getCategories = asyncHandler(async (req, res) => {
  const q = req.query;
  const search = text(q.searchString, 100);
  const filter: Record<string, any> = {};
  if (search) filter.$or = [{ categoryname: { $regex: escapeRegex(search), $options: "i" } }, { subCategories: { $regex: escapeRegex(search), $options: "i" } }];
  if (q.fromDate || q.toDate) filter.createdAt = { ...(q.fromDate && { $gte: new Date(q.fromDate) }), ...(q.toDate && { $lte: new Date(q.toDate) }) };

  const payload = await cached(NS.categories, { list: q }, async () => ({
    success: true,
    ...(await getPaginatedData(Category, filter, {
      page: q.currentPage,
      limit: toInt(q.pageSize, 5, 1, 100),
      sortOn: ["order", "categoryname", "createdAt"].includes(q.sortOn) ? q.sortOn : "order",
      sortDirection: q.sortDirection ?? "asc",
      searchString: search,
      isAllRecord: q.isAllRecord === "true",
      select: "categoryname subCategories order",
      lean: true,
    })),
  }));

  setHttpCache(req, res);
  return res.status(200).json(payload);
});

// One category or an array of them
export const createCategory = asyncHandler(async (req, res) => {
  const items = (Array.isArray(req.body) ? req.body : [req.body]).map((item) => ({
    categoryname: text(item?.categoryname, 60),
    subCategories: Array.isArray(item?.subCategories) ? item.subCategories.map((s: unknown) => text(s, 60)).filter(Boolean) : [],
  }));
  if (items.some((item) => !item.categoryname)) return fail(res, 400, "Category name is required");
  if (await Category.exists({ categoryname: { $in: items.map((item) => item.categoryname) } })) return fail(res, 400, "Category already exists");

  const created = await Category.insertMany(items);
  await changed();
  return ok(res, Array.isArray(req.body) ? created : created[0], "Category created successfully", 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const categoryname = text(req.body.categoryname, 60);
  if (!categoryname) return fail(res, 400, "Category name is required");

  const category = await Category.findByIdAndUpdate(req.params.id, { categoryname }, { returnDocument: "after", runValidators: true });
  if (!category) return fail(res, 404, "Category not found");
  await changed();
  return ok(res, category, "Category updated successfully");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!(await Category.findByIdAndDelete(req.params.id))) return fail(res, 404, "Category not found");
  await changed();
  return ok(res, undefined, "Category deleted successfully");
});

export const reorderCategories = asyncHandler(async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders) || !orders.length || !orders.every((o) => isObjectId(o?.id) && Number.isFinite(o.order))) {
    return fail(res, 400, "Orders array is required");
  }
  await Category.bulkWrite(orders.map(({ id, order }) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
  await changed();
  return ok(res, undefined, "Categories reordered successfully");
});

/* ---------- sub-categories: each change is one atomic update ---------- */
export const addSubCategory = asyncHandler(async (req, res) => {
  const name = text(req.body.subCategoryName, 60);
  if (!name) return fail(res, 400, "Sub-category name is required");

  const category = await Category.findOneAndUpdate({ _id: req.params.id, subCategories: { $not: exactly(name) } }, { $push: { subCategories: name } }, { returnDocument: "after" });
  if (!category) {
    const exists = await Category.exists({ _id: req.params.id });
    return fail(res, exists ? 400 : 404, exists ? "Sub-category already exists" : "Category not found");
  }
  await changed();
  return ok(res, category, "Sub-category added successfully");
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const oldName = text(req.body.oldSubCategoryName, 60);
  const newName = text(req.body.newSubCategoryName, 60);
  if (!oldName || !newName) return fail(res, 400, "Both old and new sub-category names are required");

  const category = await Category.findOneAndUpdate({ _id: req.params.id, subCategories: exactly(oldName) }, { $set: { "subCategories.$": newName } }, { returnDocument: "after", runValidators: true });
  if (!category) return fail(res, 404, "Category or original sub-category not found");
  await changed();
  return ok(res, category, "Sub-category updated successfully");
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { $pull: { subCategories: exactly(text(req.body.subCategoryName, 60)) } }, { returnDocument: "after" });
  if (!category) return fail(res, 404, "Category not found");
  await changed();
  return ok(res, category, "Sub-category removed successfully");
});
