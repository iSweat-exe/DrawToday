import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/data/health";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Daily keep-alive (Vercel Cron, see `vercel.json`): one tiny call so that the free Supabase project is never
 * paused after 7 days without activity. When `CRON_SECRET` is set (Vercel sends it as a bearer token to its cron
 * jobs) any other caller is refused; without it the route stays open, which is harmless (nothing is returned)
 * but lets anybody spend function invocations.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401, headers: NO_STORE });
  }

  const alive = await pingDatabase();
  return NextResponse.json({ ok: alive }, { status: alive ? 200 : 503, headers: NO_STORE });
}
