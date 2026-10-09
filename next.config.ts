import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origin of the Supabase project, e.g. https://xxxx.supabase.co (REST/Auth/Storage + Realtime websocket).
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "https://*.supabase.co";
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// Profile pictures served by the sign-in providers (Discord, GitHub). Keep in sync with `AVATAR_HOSTS`
// (src/lib/auth/account.ts); src/ci/next-config.test.ts checks it.
const avatarOrigins = ["https://cdn.discordapp.com", "https://avatars.githubusercontent.com"].join(
  " ",
);

// Content Security Policy. Any new external origin (video host, image CDN, analytics, avatars of an OAuth
// provider...) must be added here in the same PR that introduces it (see docs/security.md).
// NOTE: 'unsafe-inline' scripts are required by Next.js unless nonces are used, which would make
// every page dynamic. Moving to nonces is tracked as a follow-up in docs/security.md.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin} ${avatarOrigins}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}${isDev ? " ws://localhost:*" : ""}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Everything sensitive is off. Enable `camera=(self)` (photo of a drawing) only with the feature that needs it.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Icons change rarely: let the browser and the CDN keep them instead of revalidating on every load.
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // The service worker must never be cached by the browser/CDN so updates apply quickly.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  cacheComponents: true,
  experimental: {
    // Client router cache: going back to a page visited less than 30 s ago does not hit the server again.
    // Writes (Server Actions with updateTag/revalidatePath) bypass it.
    staleTimes: { dynamic: 30 },
  },
  cacheLife: {
    // Public data shared by every visitor (exercises, tips, video list): at most one database read per 2 min per
    // server instance, refreshed in the background, dropped after 10 min without a visit. Writes expire it at once
    // (updateTag). See docs/performance.md.
    feed: { stale: 30, revalidate: 120, expire: 600 },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
