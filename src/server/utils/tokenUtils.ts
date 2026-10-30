import crypto from "crypto";
import jwt from "jsonwebtoken";

const secret = (name: "JWT_SECRET" | "JWT_REFRESH_SECRET") => {
  const value = process.env[name];
  if (!value || value.length < 32) throw new Error(`${name} must be set to a random string of at least 32 characters`);
  return value;
};

export const REFRESH_COOKIE = "bambotia_refresh";
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // seconds, matches JWT_REFRESH_EXPIRE default

// Short-lived token sent with every request (Authorization: Bearer <token>)
export const generateAccessToken = (id: string) =>
  jwt.sign({ id }, secret("JWT_SECRET"), { algorithm: "HS256", expiresIn: (process.env.JWT_ACCESS_EXPIRE || "15m") as jwt.SignOptions["expiresIn"] });

// Long-lived token (jti makes every one unique, even two issued in the same second), only ever stored in an httpOnly cookie, used to mint new access tokens
export const generateRefreshToken = (id: string) =>
  jwt.sign({ id, jti: crypto.randomUUID() }, secret("JWT_REFRESH_SECRET"), { algorithm: "HS256", expiresIn: (process.env.JWT_REFRESH_EXPIRE || "30d") as jwt.SignOptions["expiresIn"] });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, secret("JWT_SECRET"), { algorithms: ["HS256"] }) as { id: string };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, secret("JWT_REFRESH_SECRET"), { algorithms: ["HS256"] }) as { id: string };

// The database stores only a hash of the refresh token. SHA-256 covers the WHOLE token
// (bcrypt only reads the first 72 bytes, which for a JWT is just the identical header).
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
