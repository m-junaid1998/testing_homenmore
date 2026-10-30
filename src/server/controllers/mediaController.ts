import Media from "../models/Media";
import asyncHandler from "../utils/asyncHandler";
import { cloudinary } from "../config/cloudinary";
import { getPaginatedData } from "../utils/paginationHelper";
import { cached, invalidate, setHttpCache, NS } from "../utils/cache";
import { embedUrl } from "../../utils/embed";
import { escapeRegex, isObjectId, text, toInt } from "../utils/safe";
import { fail, ok } from "../utils/respond";

// Carousel banners and reels: only what the storefront needs to show them.
export const getAllMedia = asyncHandler(async (req, res) => {
  const q = req.query;
  const search = text(q.searchString, 100);
  const filter: Record<string, any> = { isPublished: true };
  if (q.key && q.key !== "ALL") filter.key = text(q.key, 40).toLowerCase();
  if (q.type === "image" || q.type === "video") filter.mediaType = q.type;
  if (search) filter.key = { $regex: escapeRegex(search), $options: "i" };

  const payload = await cached(NS.media, { list: q }, async () => {
    const { pagination, data } = await getPaginatedData(Media, filter, {
      page: q.currentPage,
      limit: toInt(q.pageSize, 10, 1, 50),
      sortOn: ["createdAt", "key"].includes(q.sortOn) ? q.sortOn : "createdAt",
      sortDirection: q.sortDirection,
      searchString: search,
      isAllRecord: q.isAllRecord === "true",
      select: "key mediaUrl mediaType createdAt",
      lean: true,
    });
    return { success: true, pagination, data };
  });

  setHttpCache(req, res);
  return res.status(200).json(payload);
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const key = text(req.body.key, 40).toLowerCase();
  const link = text(req.body.url, 500);
  if (!key) return fail(res, 400, "Key is required.");

  // a pasted Instagram / Facebook / TikTok link is stored as is and played by the storefront through an embed
  if (link) {
    if (!embedUrl(link)) return fail(res, 400, "Use a full Instagram, Facebook or TikTok video link.");
    const saved = await Media.create({ key, mediaUrl: link, mediaType: "video", isPublished: req.body.isPublished !== "false" });
    await invalidate(NS.media);
    return ok(res, [saved], "Video link added successfully.", 201);
  }

  if (!req.files?.length) return fail(res, 400, "Upload a file or paste a video link.");
  const saved = await Media.insertMany(
    req.files.map((file) => ({
      key,
      mediaUrl: file.path,
      public_id: file.filename,
      mediaType: file.mimetype.startsWith("video/") ? "video" : "image",
      isPublished: req.body.isPublished === undefined || req.body.isPublished === "true",
    }))
  );
  await invalidate(NS.media);
  return ok(res, saved, `${saved.length} Media asset(s) uploaded successfully.`, 201);
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const media = isObjectId(req.params.id) ? await Media.findByIdAndDelete(req.params.id) : null;
  if (!media) return fail(res, 404, "Media record not found.");
  if (media.public_id) await cloudinary.uploader.destroy(media.public_id, { resource_type: media.mediaType }).catch(() => undefined);
  await invalidate(NS.media);
  return ok(res, undefined, "Media successfully deleted.");
});
