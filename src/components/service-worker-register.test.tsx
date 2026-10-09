import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceWorkerRegister } from "./service-worker-register";

const register = vi.fn();

function stubServiceWorker(result: () => Promise<unknown>) {
  register.mockImplementation(result);
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { register },
  });
}

beforeEach(() => register.mockReset());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "serviceWorker");
});

describe("ServiceWorkerRegister", () => {
  it("renders nothing", () => {
    stubServiceWorker(() => Promise.resolve({}));
    const { container } = render(<ServiceWorkerRegister />);
    expect(container).toBeEmptyDOMElement();
  });

  it("registers /sw.js for the whole site in production, without HTTP caching of the script", () => {
    vi.stubEnv("NODE_ENV", "production");
    stubServiceWorker(() => Promise.resolve({}));
    render(<ServiceWorkerRegister />);
    expect(register).toHaveBeenCalledExactlyOnceWith("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  });

  it("does not register in development (stale caches while coding)", () => {
    vi.stubEnv("NODE_ENV", "development");
    stubServiceWorker(() => Promise.resolve({}));
    render(<ServiceWorkerRegister />);
    expect(register).not.toHaveBeenCalled();
  });

  it("does not register in the tests", () => {
    stubServiceWorker(() => Promise.resolve({}));
    render(<ServiceWorkerRegister />);
    expect(register).not.toHaveBeenCalled();
  });

  it("does nothing, without error, in a browser without service workers", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect("serviceWorker" in navigator).toBe(false);
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
  });

  it("logs a failed registration instead of crashing the page", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("blocked");
    // A hand-made rejection: vitest follows the promises returned by a mock and would report this one as unhandled.
    const rejected = {
      catch: (handler: (error: unknown) => void) => handler(failure),
    };
    stubServiceWorker(() => rejected as unknown as Promise<unknown>);
    render(<ServiceWorkerRegister />);
    expect(log).toHaveBeenCalledWith("Service worker registration failed:", failure);
  });
});
