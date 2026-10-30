import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Media section key is required (e.g., carousel, asider)"],
      trim: true,
      lowercase: true,
    },
    mediaUrl: {
      type: String,
      required: [true, "Media URL is required"],
    },
    public_id: { type: String }, // empty for pasted Instagram / Facebook / TikTok links
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type (image or video) must be specified"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ isPublished: 1, key: 1, createdAt: -1 });

export default (mongoose.models.Media as mongoose.Model<any>) || mongoose.model("Media", mediaSchema);