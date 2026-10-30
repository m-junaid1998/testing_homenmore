import Wishlist from "../models/Wishlist";
import asyncHandler from "../utils/asyncHandler";
import { getIdentityFilter, getIdentityPayload } from "../utils/identityHelper";
import { isObjectId } from "../utils/safe";

const POPULATE = "name salePrice images stock category subcategory";
const MAX_ITEMS = 200;

// Toggles one product, or adds a list of products (used when a guest wishlist is merged).
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const ids: unknown[] = Array.isArray(productId) ? productId : [productId];
  if (ids.length === 0 || ids.length > MAX_ITEMS || !ids.every(isObjectId)) {
    return res.status(400).json({ success: false, message: "Invalid product" });
  }

  const wishlist = (await Wishlist.findOne(getIdentityFilter(req))) ?? new Wishlist({ ...getIdentityPayload(req), products: [] });
  const has = (id: string) => wishlist.products.some((existing: any) => existing.toString() === id);

  let message = "Products added to wishlist";
  if (Array.isArray(productId)) {
    ids.forEach((id) => !has(id as string) && wishlist.products.push(id));
  } else if (has(productId)) {
    wishlist.products = wishlist.products.filter((existing: any) => existing.toString() !== productId);
    message = "Removed from wishlist";
  } else {
    if (wishlist.products.length >= MAX_ITEMS) return res.status(400).json({ success: false, message: "Wishlist is full" });
    wishlist.products.push(productId);
    message = "Added to wishlist";
  }

  await wishlist.save();
  await wishlist.populate("products", POPULATE);
  return res.status(200).json({ success: true, message, data: wishlist });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne(getIdentityFilter(req)).populate("products", POPULATE);
  return res.status(200).json({ success: true, data: wishlist ?? { products: [] } });
});
