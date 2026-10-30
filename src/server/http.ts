import type { ApiRequest, ApiResponse, CookieOptions, Handler } from "./types";

/** Minimal Express-like response: controllers call res.status(200).json({...}) as before. */
export function createResponse(): ApiResponse {
  const res: ApiResponse = {
    statusCode: 200,
    headers: {},
    cookies: [],
    body: undefined,
    sent: false,
    status(code) {
      res.statusCode = code;
      return res;
    },
    set(name, value) {
      res.headers[name.toLowerCase()] = value;
      return res;
    },
    json(body) {
      res.body = body;
      res.sent = true;
      return res;
    },
    // httpOnly: JavaScript in the browser can never read it, so XSS cannot steal it.
    cookie(name, value, options: CookieOptions = {}) {
      const parts = [`${name}=${encodeURIComponent(value)}`, "HttpOnly", "SameSite=Lax", `Path=${options.path ?? "/"}`];
      if (process.env.NODE_ENV === "production") parts.push("Secure");
      if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
      res.cookies.push(parts.join("; "));
      return res;
    },
  };
  return res;
}

const parseCookies = (header: string | null): Record<string, string> => {
  const cookies: Record<string, string> = {};
  (header ?? "").split(";").forEach((pair) => {
    const index = pair.indexOf("=");
    if (index > 0) cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1).trim());
  });
  return cookies;
};

export function createRequest(input: {
  method: string;
  headers: Headers;
  query: Record<string, string>;
  params: Record<string, string>;
  body: any;
}): ApiRequest {
  const headers: Record<string, string> = {};
  input.headers.forEach((value, key) => (headers[key.toLowerCase()] = value));

  return {
    method: input.method,
    headers,
    query: input.query,
    params: input.params,
    body: input.body ?? {},
    cookies: parseCookies(input.headers.get("cookie")),
    ip: (headers["x-forwarded-for"] || "").split(",")[0].trim() || headers["x-real-ip"] || "unknown",
    guestId: null,
    header: (name) => headers[name.toLowerCase()],
  };
}

/** Runs one handler or middleware and resolves when it calls next() or sends a response. */
export function runStep(handler: Handler, req: ApiRequest, res: ApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    const next = (err?: unknown) => (err ? reject(err) : resolve());
    try {
      Promise.resolve(handler(req, res, next)).then(() => resolve(), reject);
    } catch (err) {
      reject(err);
    }
  });
}
