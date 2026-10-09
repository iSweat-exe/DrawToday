// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

/** Runs public/sw.js against a fake worker scope and returns the handlers it registered. */
function loadWorker() {
  const handlers = new Map<string, (event: unknown) => void>();
  const scope = {
    addEventListener: (type: string, handler: (event: unknown) => void) =>
      handlers.set(type, handler),
    skipWaiting: vi.fn(() => Promise.resolve()),
    clients: { claim: vi.fn(() => Promise.resolve()) },
  };
  new Function("self", readFileSync(join(process.cwd(), "public/sw.js"), "utf8"))(scope);
  return { handlers, scope };
}

describe("service worker (public/sw.js)", () => {
  it("listens to install and activate only (no fetch handler yet: nothing is intercepted)", () => {
    expect([...loadWorker().handlers.keys()].sort()).toEqual(["activate", "install"]);
  });

  it("takes over right after installing", () => {
    const { handlers, scope } = loadWorker();
    handlers.get("install")!({});
    expect(scope.skipWaiting).toHaveBeenCalledTimes(1);
  });

  it("claims the open pages when it activates, and tells the browser to wait for it", () => {
    const { handlers, scope } = loadWorker();
    const waitUntil = vi.fn();
    handlers.get("activate")!({ waitUntil });
    expect(scope.clients.claim).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
