import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }, 
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // These packages are loaded from node_modules at runtime instead of being bundled.
  serverExternalPackages: ["mongoose", "bcryptjs", "jsonwebtoken", "cloudinary", "nodemailer", "google-auth-library"],
  images: {
    // Product photos are resized by Cloudinary (src/lib/cloudinaryLoader.ts)
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Pages are rendered per request, but must not be "no-store": that switches off the browser's back/forward cache.
      { source: "/((?!api|_next|admin|login|signup).*)", headers: [{ key: "Cache-Control", value: "private, no-cache" }] },
      { source: "/:path*.(avif|svg|png|jpg|webp|ico)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
  async redirects() {
    // www.bambotia.com -> bambotia.com (one address for Google)
    return [{ source: "/:path*", has: [{ type: "host", value: "www.bambotia.com" }], destination: "https://bambotia.com/:path*", permanent: true }];
  },
};

export default nextConfig;
