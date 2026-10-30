import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    subCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Category as mongoose.Model<any>) || mongoose.model("Category", categorySchema);