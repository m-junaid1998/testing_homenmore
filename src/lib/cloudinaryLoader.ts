import { cloudinaryUrl } from "@/utils/seo";

/**
 * next/image loader: images are resized and re-encoded by Cloudinary's CDN instead of this server,
 * so there is no /_next/image CPU cost and every <Image> still gets a proper srcset.
 */
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return cloudinaryUrl(src, width, quality && quality < 60 ? "auto:eco" : "auto:good");
}
