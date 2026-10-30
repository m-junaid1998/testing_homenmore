import mongoose from "mongoose";
import Cart from "./models/Cart";
import Category from "./models/Category";
import CategoryImage from "./models/CategoryImage";
import Contact from "./models/Contact";
import Media from "./models/Media";
import Order from "./models/Order";
import Product from "./models/Product";
import Review from "./models/Review";
import User from "./models/User";
import Setting from "./models/Setting";
import Wishlist from "./models/Wishlist";
import { uniqueProductSlug } from "./utils/slug";

// Next.js re-evaluates modules (dev reloads, serverless), so the connection is kept on `global`.
// Without this every request would open a new MongoDB connection.
const globalForMongo = globalThis as unknown as { mongo?: { promise: Promise<typeof mongoose> | null; failedAt: number } };
const cache = (globalForMongo.mongo ??= { promise: null, failedAt: 0 });

// Indexes are built on purpose, not on every server start: set SYNC_INDEXES=true for ONE deploy, then remove it.
// syncIndexes() creates the indexes in the models and drops any index that is not in them (old, unused ones).
mongoose.set("autoIndex", false);

const syncIndexes = async () => {
  // Old carts / wishlists stored `user: null`, which breaks the unique-per-user index: remove those nulls first.
  for (const model of [Cart, Wishlist]) {
    await model.updateMany({ user: null }, { $unset: { user: "" } });
    await model.updateMany({ guestId: null }, { $unset: { guestId: "" } });
  }
  // products created before product URLs existed: give each one its slug
  for (const product of await Product.find({ slug: { $exists: false } }).select("name").lean()) {
    await Product.updateOne({ _id: product._id }, { $set: { slug: await uniqueProductSlug(product.name) } });
  }
  for (const model of [Cart, Category, CategoryImage, Contact, Media, Order, Product, Review, Setting, User, Wishlist]) {
    await model.syncIndexes();
  }
  console.log("MongoDB indexes are in sync with the models.");
};

const RETRY_AFTER_MS = 10_000; // after a failure, fail fast instead of waiting for the timeout on every request

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  if (Date.now() - cache.failedAt < RETRY_AFTER_MS) throw new Error("Database unavailable (retrying shortly)");

  cache.promise ??= mongoose
    .connect(process.env.MONGO_URI, { bufferCommands: false, maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
    .then(async (connection) => {
      if (process.env.SYNC_INDEXES === "true") await syncIndexes();
      return connection;
    })
    .catch((err) => {
      cache.promise = null;
      cache.failedAt = Date.now();
      throw err;
    });
  return cache.promise;
}
