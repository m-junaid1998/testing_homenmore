import { NextResponse, type NextRequest } from "next/server";
import { dispatch } from "@/server/dispatch";
import { corsHeaders, isAllowedOrigin } from "@/server/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// One handler serves every /api/... URL: src/server/routes.ts decides what runs.
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const cors = corsHeaders(origin, host);

  // A browser on another website must never change data (CSRF), whatever cookies it holds.
  if (WRITE_METHODS.includes(request.method) && !isAllowedOrigin(origin, host)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers: cors });
  }

  const { path } = await context.params;
  const result = await dispatch({
    method: request.method,
    path: "/" + path.join("/"),
    query: Object.fromEntries(request.nextUrl.searchParams),
    headers: request.headers,
    request,
  });

  const headers = new Headers({ ...result.headers, ...cors });
  result.cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));
  // Anything that is not explicitly public (cart, orders, account...) must never be cached by a proxy or CDN.
  if (!headers.has("cache-control")) headers.set("Cache-Control", "no-store");

  return NextResponse.json(result.body ?? {}, { status: result.status, headers });
}

// CORS preflight: answered here, never reaches the controllers.
function preflight(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = !!origin && isAllowedOrigin(origin, request.headers.get("host"));
  return new NextResponse(null, { status: allowed ? 204 : 403, headers: corsHeaders(origin, request.headers.get("host")) });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, preflight as OPTIONS };
