import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/data/health";

const NO_STORE = { "Cache-Control": "no-store" };

/** An answer is reused for this long, so that a public URL cannot be used to hammer the database. */
const CACHE_MS = 10_000;
let cached: { at: number; up: boolean } | null = null;

/**
 * Public health check for an uptime monitor (UptimeRobot, Better Stack...): `200` with `{ status: "ok" }` while
 * the database answers, `503` with `{ status: "down" }` otherwise. It returns nothing but the status, never a
 * measure, a count or a configuration detail. The answer is cached for 10 seconds per instance.
 */
export async function GET() {
  const now = Date.now();
  if (!cached || now - cached.at > CACHE_MS) {
    cached = { at: now, up: await pingDatabase() };
  }
  const { up } = cached;
  return NextResponse.json(
    { status: up ? "ok" : "down" },
    { status: up ? 200 : 503, headers: NO_STORE },
  );
}
