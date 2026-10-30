import { cloudinary, uploadProfiles, type UploadProfile } from "./config/cloudinary";
import type { UploadedFile } from "./types";

export interface UploadSpec {
  field: string; // form field that holds the file(s)
  profile: UploadProfile;
  max?: number; // how many files are accepted (default 1)
  single?: boolean; // true -> req.file instead of req.files
}

const MAX_JSON_BYTES = 1024 * 1024; // 1 MB is plenty for any JSON request

export interface ParsedBody {
  body: any;
  rawFiles: { field: string; file: File }[];
}

/** Reads a JSON / form / multipart request. Nothing is uploaded here: files are sent to Cloudinary only after login checks pass. */
export async function readBody(request: Request): Promise<ParsedBody> {
  const type = request.headers.get("content-type") || "";

  if (type.includes("application/json")) {
    const text = await request.text();
    if (text.length > MAX_JSON_BYTES) throw Object.assign(new Error("Request body too large"), { status: 413 });
    try {
      return { body: text ? JSON.parse(text) : {}, rawFiles: [] };
    } catch {
      throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
    }
  }

  if (type.includes("multipart/form-data") || type.includes("application/x-www-form-urlencoded")) {
    const body: Record<string, string | string[]> = {};
    const rawFiles: ParsedBody["rawFiles"] = [];
    for (const [key, value] of (await request.formData()).entries()) {
      if (typeof value !== "string") rawFiles.push({ field: key, file: value });
      else body[key] = key in body ? ([] as string[]).concat(body[key], value) : value;
    }
    return { body, rawFiles };
  }

  return { body: {}, rawFiles: [] };
}

const isAllowedType = (profile: UploadProfile, mime: string) =>
  mime.startsWith("image/") || (profile === "media" && mime.startsWith("video/"));

/** Validates (type + size) and uploads files to Cloudinary. */
export async function uploadFiles(rawFiles: ParsedBody["rawFiles"], spec: UploadSpec) {
  const { maxSize, ...options } = uploadProfiles[spec.profile];
  const picked = rawFiles.filter((f) => f.field === spec.field && f.file.size > 0).slice(0, spec.max ?? 1);

  const uploaded: UploadedFile[] = await Promise.all(
    picked.map(async ({ file }) => {
      if (!isAllowedType(spec.profile, file.type) || file.type === "image/svg+xml") {
        throw Object.assign(new Error("Unsupported file type."), { status: 400 });
      }
      if (file.size > maxSize) {
        throw Object.assign(new Error(`File too large (max ${Math.round(maxSize / 1024 / 1024)} MB).`), { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (err, res) => (err || !res ? reject(err) : resolve(res))).end(buffer);
      });
      return { path: result.secure_url, filename: result.public_id, mimetype: file.type, size: file.size };
    })
  );

  return spec.single ? { file: uploaded[0] } : { files: uploaded };
}
