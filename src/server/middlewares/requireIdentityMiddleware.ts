import type { Handler } from "../types";

// Use AFTER optionalAuthMiddleware on routes for logged-in users and guests (cart, wishlist, orders, reviews).
const requireIdentityMiddleware: Handler = (req, res, next) => {
  if (!req.user && !req.guestId) {
    return res.status(400).json({
      success: false,
      message: "Login required, or send an 'x-guest-id' header (get one from GET /api/auth/guest) to continue as guest.",
    });
  }
  next();
};

export default requireIdentityMiddleware;
