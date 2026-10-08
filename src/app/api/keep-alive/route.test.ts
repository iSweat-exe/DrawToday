import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const pingDatabase = vi.fn();
vi.mock("@/lib/data/health", () => ({ pingDatabase: () => pingDatabase() }));

const request = (headers: Record<string, string> = {}) =>
  new Request("https://drawtoday.app/api/keep-alive", { headers });

beforeEach(() => {
  vi.clearAllMocks();
  pingDatabase.mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/keep-alive", () => {
  it("touches the database and answers ok, never cached", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(pingDatabase).toHaveBeenCalledOnce();
  });

  it("answers 503 when the database cannot be reached", async () => {
    pingDatabase.mockResolvedValue(false);
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false });
  });

  it("requires the cron secret when one is configured, and does not touch the database without it", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    expect((await GET(request())).status).toBe(401);
    expect((await GET(request({ authorization: "Bearer wrong" }))).status).toBe(401);
    expect(pingDatabase).not.toHaveBeenCalled();
    expect((await GET(request({ authorization: "Bearer s3cret" }))).status).toBe(200);
  });
});
