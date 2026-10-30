// Browsers on these sites may call the API (cookies included). Everything else is refused.
export const ALLOWED_ORIGINS = ["https://homenmorestudio.com","https://www.homenmorestudio.com"];
if (process.env.NODE_ENV !== "production") ALLOWED_ORIGINS.push("http://localhost:3000");

/** The site's own pages (same host) and the allowed list may call the API. Requests without an Origin (server-to-server, curl) pass. */
export const isAllowedOrigin = (origin: string | null | undefined, host?: string | null) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  return !!host && (origin === `https://${host}` || origin === `http://${host}`);
};

/** Response headers that let an allowed origin read the response. */
export const corsHeaders = (origin: string | null | undefined, host?: string | null): Record<string, string> => {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (!origin || !isAllowedOrigin(origin, host)) return headers;
  return {
    ...headers,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-guest-id",
    "Access-Control-Max-Age": "86400",
  };
};
