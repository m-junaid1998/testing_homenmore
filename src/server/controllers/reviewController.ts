import mongoose from "mongoose";
import Review from "../models/Review";
import Product from "../models/Product";
import asyncHandler from "../utils/asyncHandler";
import { getIdentityFilter, getIdentityPayload } from "../utils/identityHelper";
import { invalidate, NS } from "../utils/cache";
import { isObjectId, text } from "../utils/safe";
import { fail } from "../utils/respond";

const recalculateProductRating = async (productId: unknown) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: productId }, { $set: { numReviews: stats?.count || 0, ratings: stats?.avg || 0 } });
  await invalidate(NS.products); // ratings appear in product cards
};

export const createProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!isObjectId(productId)) return fail(res, 400, "Invalid product");

  const rating = Number(req.body.rating);
  const name = text(req.body.name, 60) || "Guest User";
  const title = text(req.body.title, 100);
  const comment = text(req.body.comment, 2000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(res, 400, "Rating must be between 1 and 5");
  if (!comment) return fail(res, 400, "Review comment is required");

  if (!(await Product.exists({ _id: productId, isPublished: true }))) return fail(res, 404, "Product not found");
  if (await Review.findOne({ product: productId, ...getIdentityFilter(req) })) {
    return fail(res, 400, "You have already reviewed this product.");
  }

  const review = await Review.create({
    ...getIdentityPayload(req),
    product: productId,
    name,
    rating,
    title,
    comment,
    photos: req.files?.map((file) => file.path) ?? [],
  });
  await recalculateProductRating(productId);

  return res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.productId)) return fail(res, 400, "Invalid product");

  const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 }).limit(200).lean();

  // user ids and guest ids are private (a guest id is the key to that guest's orders): send only `isMine`.
  const data = reviews.map(({ user, guestId, ...review }: any) => ({
    ...review,
    isMine: Boolean((req.user && user && String(user) === req.user.id) || (req.guestId && guestId === req.guestId)),
  }));
  return res.status(200).json({ success: true, count: data.length, data });
});

export const deleteReview = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) return fail(res, 400, "Invalid review");

  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, 404, "Review not found");

  const isAdmin = req.user?.role === "admin";
  const isOwner = (req.user && review.user && String(review.user) === req.user.id) || (req.guestId && review.guestId === req.guestId);
  if (!isAdmin && !isOwner) return fail(res, 403, "Unauthorized. You can only delete your own reviews.");

  await review.deleteOne();
  await recalculateProductRating(review.product);

  return res.status(200).json({ success: true, message: "Review successfully deleted and product ratings updated." });
});
