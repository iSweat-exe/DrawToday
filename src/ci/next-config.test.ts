// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_HOSTS } from "../lib/auth/account";

type Header = { key: string; value: string };
type Route = { source: string; headers: Header[] };

async function load(env: "production" | "development", supabaseUrl?: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", env);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl ?? "");
  const { default: config } = await import("../../next.config");
  const routes = (await config.headers!()) as Route[];
  const find = (source: string) => routes.find((route) => route.source === source)!;
  const header = (route: Route, key: string) =>
    route.headers.find((item) => item.key === key)?.value;
  const all = find("/:path*");
  return { config, routes, find, header, all, csp: header(all, "Content-Security-Policy")! };
}

afterEach(() => vi.unstubAllEnvs());

describe("next.config: security headers in production", () => {
  it("sends the baseline headers on every route", async () => {
    const { header, all } = await load("production", "https://abc.supabase.co");
    expect(header(all, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(all, "X-Frame-Options")).toBe("DENY");
    expect(header(all, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(all, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(header(all, "Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
  });

  it("switches off the sensitive browser features", async () => {
    const { header, all } = await load("production");
    const policy = header(all, "Permissions-Policy")!;
    for (const feature of ["camera", "microphone", "geolocation", "payment"]) {
      expect(policy).toContain(`${feature}=()`);
    }
  });

  it("has a strict CSP: nothing from outside, no plugins, no framing, HTTPS only", async () => {
    const { csp } = await load("production", "https://abc.supabase.co");
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ]) {
      expect(csp.split("; "), directive).toContain(directive);
    }
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("ws://localhost");
  });

  it("lets the app talk to its own Supabase project (REST and realtime), and only that", async () => {
    const { csp } = await load("production", "https://abc.supabase.co/rest/v1");
    expect(csp).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
    expect(csp).toContain("img-src 'self' data: blob: https://abc.supabase.co");
    expect(csp).not.toContain("*");
  });

  it("lets the profile pictures of the sign-in providers load, and only those", async () => {
    const { csp } = await load("production", "https://abc.supabase.co");
    const imgSrc = csp.split("; ").find((directive) => directive.startsWith("img-src "))!;
    const origins = imgSrc.split(" ").filter((source) => source.startsWith("https://"));
    expect(origins.sort()).toEqual(
      ["https://abc.supabase.co", ...AVATAR_HOSTS.map((host) => `https://${host}`)].sort(),
    );
  });

  it("falls back to any Supabase project when the URL is not set", async () => {
    const { csp } = await load("production");
    expect(csp).toContain("https://*.supabase.co");
  });

  it("allows no remote script", async () => {
    const { csp } = await load("production", "https://abc.supabase.co");
    const script = csp.split("; ").find((directive) => directive.startsWith("script-src"))!;
    expect(script).toBe("script-src 'self' 'unsafe-inline'");
  });
});

describe("next.config: development", () => {
  it("allows what the dev server needs, and does not force HTTPS", async () => {
    const { csp, header, all } = await load("development", "https://abc.supabase.co");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws://localhost:*");
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(header(all, "Strict-Transport-Security")).toBeUndefined();
  });
});

describe("next.config: caching", () => {
  it("never caches the service worker, so an update applies right away", async () => {
    const { find, header } = await load("production");
    const route = find("/sw.js");
    expect(header(route, "Cache-Control")).toBe("no-cache, no-store, must-revalidate");
    expect(header(route, "Content-Type")).toBe("application/javascript; charset=utf-8");
  });

  it("keeps the icons for a day and serves them stale for a week while refreshing", async () => {
    const { find, header } = await load("production");
    expect(header(find("/icons/:path*"), "Cache-Control")).toBe(
      "public, max-age=86400, stale-while-revalidate=604800",
    );
  });

  it("describes the public data cache profile", async () => {
    const { config } = await load("production");
    expect(config.cacheLife?.feed).toEqual({ stale: 30, revalidate: 120, expire: 600 });
    expect(config.cacheComponents).toBe(true);
  });
});
