import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    // URL name, made from `name` once and then kept stable so links and Google rankings do not break
    slug: { type: String, trim: true, lowercase: true },
    categoryname: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subCategory: {
      type: String,
      default: "None",
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    regularPrice: {
      type: Number,
      required: [true, "Regular price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    discount: {
      type: String,
      default: "0%",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    images: {
      type: [String],
      required: [true, "Product image is required"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    colors: {
      type: [String],
      default: [],
    },
    // Each size carries its own prices. Top-level regularPrice/salePrice mirror the cheapest size.
    sizes: {
      type: [
        {
          _id: false,
          label: { type: String, required: true, trim: true, maxlength: 40 },
          regularPrice: { type: Number, required: true, min: 0 },
          salePrice: { type: Number, required: true, min: 0 },
          discount: { type: String, default: "0%" },
        },
      ],
      default: [],
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes match the real queries (each one is used by a listing below; unused indexes only slow down writes).
// Search uses a regex on name/description, which a text index cannot serve, so there is none.
productSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: "string" } } }); // product page lookup
productSchema.index({ isPublished: 1, createdAt: -1 }); // shop listing, new arrivals
productSchema.index({ isPublished: 1, salePrice: 1 }); // sort / filter by price
productSchema.index({ isPublished: 1, categoryname: 1, createdAt: -1 }); // category pages, related products
productSchema.index({ isPublished: 1, ratings: -1, numReviews: -1 }); // top rated
productSchema.index({ isBestSeller: 1, isPublished: 1, createdAt: -1 }); // best sellers

export default (mongoose.models.Product as mongoose.Model<any>) || mongoose.model("Product", productSchema);