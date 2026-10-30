import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { text } from "../utils/safe";
import {
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/tokenUtils";
import { fail } from "../utils/respond";
import { isAllowedOrigin } from "../cors";
import type { ApiRequest, ApiResponse } from "../types";

const EMAIL = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt ignores everything after 72 bytes

const passwordError = (password: unknown) =>
  typeof password !== "string" || password.length < MIN_PASSWORD || password.length > MAX_PASSWORD
    ? `Password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters long`
    : "";

// The refresh token never reaches JavaScript: it lives in an httpOnly cookie, only sent to /api/auth.
const startSession = async (user: any, res: ApiResponse, message: string) => {
  const refreshToken = generateRefreshToken(user.id);
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  res.cookie(REFRESH_COOKIE, refreshToken, { maxAge: REFRESH_MAX_AGE, path: "/api/auth" });

  const accessToken = generateAccessToken(user.id);
  return {
    success: true,
    message,
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    accessToken,
    token: accessToken,
  };
};

// Cookie-based endpoints must only be called from our own sites (CSRF protection on top of SameSite=Lax).
const isSameSite = (req: ApiRequest) => isAllowedOrigin(req.header("origin"), req.header("host"));

export const registerUser = asyncHandler(async (req, res) => {
  const firstname = text(req.body.firstname, 50);
  const lastname = text(req.body.lastname, 50);
  const email = text(req.body.email, 120).toLowerCase();
  const { password } = req.body;

  if (!firstname || !lastname || !email || !password) return fail(res, 400, "Please fill all fields");
  if (!EMAIL.test(email)) return fail(res, 400, "Please use a valid email address");
  if (passwordError(password)) return fail(res, 400, passwordError(password));
  if (await User.findOne({ email })) return fail(res, 400, "User already exists with this email");

  // role is never read from the request: everybody who registers is a customer
  const user = await User.create({ firstname, lastname, email, password, role: "customer" });
  return res.status(201).json(await startSession(user, res, "Registration successful"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = text(req.body.email, 120).toLowerCase();
  const { password } = req.body;

  const user = email && typeof password === "string" ? await User.findOne({ email }) : null;
  if (!user || !(await user.matchPassword(password))) return fail(res, 401, "Invalid email or password");

  return res.status(200).json(await startSession(user, res, "Login successful"));
});

export const googleLogin = asyncHandler(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) return fail(res, 503, "Google login is not configured on this server.");
  const idToken = text(req.body.idToken, 4000);
  if (!idToken) return fail(res, 400, "Google ID Token is required");

  let payload;
  try {
    const ticket = await new OAuth2Client(process.env.GOOGLE_CLIENT_ID).verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    return fail(res, 400, "Google authentication failed");
  }
  // Only trust an e-mail address that Google itself has verified (otherwise accounts could be taken over)
  if (!payload?.email || !payload.email_verified) return fail(res, 400, "Your Google email address is not verified");

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstname: payload.given_name || payload.name?.split(" ")[0] || "Google",
      lastname: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "User",
      email,
      password: crypto.randomBytes(24).toString("hex"), // random: Google users never log in with a password
    });
  }
  return res.status(200).json(await startSession(user, res, "Google login successful"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  if (!isSameSite(req)) return fail(res, 403, "Forbidden");
  const refreshToken = req.cookies[REFRESH_COOKIE];
  if (!refreshToken) return fail(res, 401, "Not signed in");

  let userId: string;
  try {
    userId = verifyRefreshToken(refreshToken).id;
  } catch {
    return fail(res, 401, "Invalid or expired refresh token");
  }

  const user = await User.findById(userId).select("+refreshToken");
  if (!user || user.refreshToken !== hashToken(refreshToken)) {
    return fail(res, 401, "Refresh token is invalid or has been revoked");
  }

  const session = await startSession(user, res, "Token refreshed"); // rotates the refresh token
  return res.status(200).json(session);
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (!isSameSite(req)) return fail(res, 403, "Forbidden");
  try {
    const { id } = verifyRefreshToken(req.cookies[REFRESH_COOKIE]);
    await User.findByIdAndUpdate(id, { refreshToken: null });
  } catch {
    // no valid cookie: nothing to revoke
  }
  res.cookie(REFRESH_COOKIE, "", { maxAge: 0, path: "/api/auth" });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getGuestId = asyncHandler(async (_req, res) => {
  return res.status(200).json({ success: true, guestId: `guest_${crypto.randomUUID()}` });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
    return fail(res, 400, "Please provide both old and new password");
  }
  if (passwordError(newPassword)) return fail(res, 400, `New password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters long`);

  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, "User not found");
  if (!(await user.matchPassword(oldPassword))) return fail(res, 400, "Incorrect old password");

  user.password = newPassword;
  user.refreshToken = null; // signs the account out everywhere else
  await user.save();
  res.cookie(REFRESH_COOKIE, "", { maxAge: 0, path: "/api/auth" });

  return res.status(200).json({ success: true, message: "Password updated successfully! Please sign in again." });
});

// Admin only (see routes.ts)
export const deleteUserByEmail = asyncHandler(async (req, res) => {
  const email = text(req.body.email, 120).toLowerCase();
  if (email === req.user.email) return fail(res, 400, "You cannot delete your own account here");

  const user = await User.findOneAndDelete({ email });
  if (!user) return fail(res, 404, "User not found");
  return res.status(200).json({ success: true, message: "User deleted successfully from database!" });
});
