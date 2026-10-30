import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"]; // no svg: it can carry scripts
const MB = 1024 * 1024;

// One upload profile per place images/videos are used: Cloudinary folder, allowed formats, max size.
export const uploadProfiles = {
  products: { folder: "Bambotia_Products", allowed_formats: IMAGE_FORMATS, transformation: [{ quality: "auto" }, { fetch_format: "auto" }], maxSize: 5 * MB },
  subcategories: { folder: "Bambotia_SubCategories", allowed_formats: IMAGE_FORMATS, transformation: [{ quality: "auto" }, { fetch_format: "auto" }], maxSize: 5 * MB },
  reviews: { folder: "Bambotia_Reviews", allowed_formats: IMAGE_FORMATS, transformation: [{ width: 800, crop: "limit" }, { quality: "auto:good" }, { fetch_format: "auto" }], maxSize: 5 * MB },
  media: { folder: "Bambotia_Media_Gallery", resource_type: "auto" as const, allowed_formats: ["mp4", "webm", "mov", ...IMAGE_FORMATS], transformation: [{ quality: "auto" }, { fetch_format: "auto" }], maxSize: 100 * MB },
};

export type UploadProfile = keyof typeof uploadProfiles;
export { cloudinary };
