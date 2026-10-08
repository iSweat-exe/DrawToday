import { beforeEach, describe, expect, it, vi } from "vitest";

const pingDatabase = vi.fn();
vi.mock("@/lib/data/health", () => ({ pingDatabase: () => pingDatabase() }));

// The route keeps a short-lived answer in memory: load a fresh copy for every test.
async function load() {
  vi.resetModules();
  return (await import("./route")).GET;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("GET /api/health", () => {
  it("answers 200 with the bare status while the database is up", async () => {
    pingDatabase.mockResolvedValue(true);
    const response = await (await load())();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("answers 503 when the database is down", async () => {
    pingDatabase.mockResolvedValue(false);
    const response = await (await load())();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "down" });
  });

  it("reuses the answer for 10 seconds so the endpoint cannot hammer the database", async () => {
    vi.useFakeTimers();
    pingDatabase.mockResolvedValue(true);
    const get = await load();
    await get();
    await get();
    expect(pingDatabase).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10_001);
    await get();
    expect(pingDatabase).toHaveBeenCalledTimes(2);
  });
});
