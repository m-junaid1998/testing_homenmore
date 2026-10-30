import type { Handler } from "../types";
import { getUserFromToken } from "./authMiddleware";

const GUEST_ID = /^guest_[0-9a-f-]{36}$/i; // exactly what /api/auth/guest hands out

// Login is optional: a valid token sets req.user, a valid x-guest-id sets req.guestId.
const optionalAuthMiddleware: Handler = async (req, _res, next) => {
  try {
    req.user = (await getUserFromToken(req)) ?? undefined;
  } catch {
    req.user = undefined;
  }
  const guestId = req.header("x-guest-id");
  req.guestId = guestId && GUEST_ID.test(guestId) ? guestId : null;
  next();
};

export default optionalAuthMiddleware;
