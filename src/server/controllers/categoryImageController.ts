import CategoryImage from "../models/CategoryImage";
import Category from "../models/Category";
import asyncHandler from "../utils/asyncHandler";
import { cloudinary } from "../config/cloudinary";
import { cached, invalidate, setHttpCache, NS } from "../utils/cache";
import { fail, ok } from "../utils/respond";
import { text } from "../utils/safe";

const changed = () => invalidate(NS.categoryImages);
const removeFromCloudinary = (publicId?: string) => (publicId ? cloudinary.uploader.destroy(publicId).catch(() => undefined) : undefined);

// Categories and their sub-categories, for the admin "pick a category" dropdowns
export const getCategoriesList = asyncHandler(async (req, res) => {
  const data = await cached(NS.categoryImages, "categories-list", () => Category.find().select("categoryname subCategories").sort({ order: 1 }).lean());
  setHttpCache(req, res);
  return ok(res, data);
});

export const getAllCategoryImages = asyncHandler(async (req, res) => {
  const data = await cached(NS.categoryImages, "all", () => CategoryImage.find().select("categoryName subCategoryName imageUrl createdAt").sort({ createdAt: -1 }).lean());
  setHttpCache(req, res);
  return res.status(200).json({ success: true, count: data.length, data });
});

export const uploadCategoryImage = asyncHandler(async (req, res) => {
  const categoryName = text(req.body.categoryName, 60);
  if (!categoryName) return fail(res, 400, "Category name is required");
  if (!req.file) return fail(res, 400, "Please upload an image file");

  const image = await CategoryImage.create({ categoryName, subCategoryName: text(req.body.subCategoryName, 60), imageUrl: req.file.path, public_id: req.file.filename });
  await changed();
  return ok(res, image, "Category image uploaded successfully", 201);
});

export const updateCategoryImage = asyncHandler(async (req, res) => {
  const image = await CategoryImage.findById(req.params.id);
  if (!image) return fail(res, 404, "Category image record not found");

  if (req.body.categoryName !== undefined) image.categoryName = text(req.body.categoryName, 60);
  if (req.body.subCategoryName !== undefined) image.subCategoryName = text(req.body.subCategoryName, 60);
  if (req.file) {
    await removeFromCloudinary(image.public_id);
    image.imageUrl = req.file.path;
    image.public_id = req.file.filename;
  }
  await image.save();
  await changed();
  return ok(res, image, "Category image updated successfully");
});

export const deleteCategoryImage = asyncHandler(async (req, res) => {
  const image = await CategoryImage.findByIdAndDelete(req.params.id);
  if (!image) return fail(res, 404, "Category image record not found");
  await removeFromCloudinary(image.public_id);
  await changed();
  return ok(res, undefined, "Category image deleted successfully");
});
