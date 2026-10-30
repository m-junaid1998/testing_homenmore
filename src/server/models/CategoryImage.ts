import mongoose from "mongoose";

const categoryImageSchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    subCategoryName: {
      type: String, 
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
  },
  { timestamps: true }
);


export default (mongoose.models.CategoryImage as mongoose.Model<any>) || mongoose.model("CategoryImage", categoryImageSchema);