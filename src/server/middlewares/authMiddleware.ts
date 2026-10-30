import type { ApiRequest, Handler } from "../types";
import User from "../models/User";
import { verifyAccessToken } from "../utils/tokenUtils";

// Reads the Bearer token, verifies it and returns the matching user (without the password).
export const getUserFromToken = async (req: ApiRequest) => {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const decoded = verifyAccessToken(authHeader.split(" ")[1]);
  return User.findById(decoded.id).select("-password");
};

const authMiddleware: Handler = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided or invalid format." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export default authMiddleware;
