import { connectDB } from "./db";
import { matchRoute, type Guard } from "./routes";
import { createRequest, createResponse, runStep } from "./http";
import { readBody, uploadFiles } from "./upload";
import type { Handler } from "./types";
import authMiddleware from "./middlewares/authMiddleware";
import adminMiddleware from "./middlewares/adminMiddleware";
import optionalAuthMiddleware from "./middlewares/optionalAuthMiddleware";
import requireIdentityMiddleware from "./middlewares/requireIdentityMiddleware";
import globalErrorHandler from "./middlewares/errorMiddleware";
import { formLimit, guestLimit, loginLimit } from "./middlewares/rateLimit";

const guards: Record<Guard, Handler[]> = {
  auth: [authMiddleware],
  admin: [adminMiddleware],
  optionalAuth: [optionalAuthMiddleware],
  identity: [optionalAuthMiddleware, requireIdentityMiddleware],
  loginLimit: [loginLimit],
  formLimit: [formLimit],
  guestLimit: [guestLimit],
};

interface DispatchInput {
  method?: string;
  path: string;
  query?: Record<string, string>;
  headers?: Headers;
  request?: Request; // present for browser calls, absent for server-side rendering
}

/**
 * Runs one API call completely in-process.
 * Used by the /api route (browser requests) AND by server components (SSR), so a
 * server-rendered page never makes an HTTP request to itself.
 */
export async function dispatch({ method = "GET", path, query = {}, headers = new Headers(), request }: DispatchInput) {
  const res = createResponse();
  const found = matchRoute(method, path);
  if (!found) return { status: 404, headers: {}, cookies: [], body: { success: false, message: "Route not found" } };

  const { route, params } = found;
  const req = createRequest({ method, headers, query, params, body: {} });
  const result = () => ({ status: res.statusCode, headers: res.headers, cookies: res.cookies, body: res.body });

  try {
    const parsed = request && method !== "GET" ? await readBody(request) : { body: {}, rawFiles: [] };
    req.body = parsed.body;

    if (!route.noDatabase) {
      try {
        await connectDB();
      } catch (err: any) {
        console.error("Database connection failed:", err.message);
        res.status(503).json({ success: false, message: "Service temporarily unavailable. Please try again shortly." });
        return result();
      }
    }

    for (const guard of route.guards.flatMap((name) => guards[name])) {
      await runStep(guard, req, res);
      if (res.sent) return result();
    }

    if (route.upload && parsed.rawFiles.length) Object.assign(req, await uploadFiles(parsed.rawFiles, route.upload));

    await runStep(route.handler, req, res);
  } catch (err: any) {
    if (err?.status) res.status(err.status); // errors raised on purpose, e.g. "file too large"
    globalErrorHandler(err, req, res);
  }
  return result();
}
