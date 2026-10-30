/** Types for the Express-style handlers that run inside Next.js (see http.ts and dispatch.ts). */

export interface UploadedFile {
  path: string; // Cloudinary URL
  filename: string; // Cloudinary public id
  mimetype: string;
  size: number;
}

export interface ApiRequest {
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body: any;
  cookies: Record<string, string>;
  ip: string;
  files?: UploadedFile[];
  file?: UploadedFile;
  user?: any; // logged-in user, set by authMiddleware
  guestId: string | null; // set by optionalAuthMiddleware
  header: (name: string) => string | undefined;
}

export interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
}

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  cookies: string[];
  body: unknown;
  sent: boolean;
  status: (code: number) => ApiResponse;
  set: (name: string, value: string) => ApiResponse;
  json: (body: unknown) => ApiResponse;
  cookie: (name: string, value: string, options?: CookieOptions) => ApiResponse;
}

export type NextFn = (err?: unknown) => void;
export type Handler = (req: ApiRequest, res: ApiResponse, next: NextFn) => unknown;
