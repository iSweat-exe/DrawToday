import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createBrowserClient = vi.fn(() => "browser-client");
const createServerClient = vi.fn(() => "server-client");
const createSupabaseClient = vi.fn(() => "public-client");

vi.mock("@supabase/ssr", () => ({ createBrowserClient, createServerClient }));
vi.mock("@supabase/supabase-js", () => ({ createClient: createSupabaseClient }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});
afterEach(() => vi.unstubAllEnvs());

describe("browser client", () => {
  it("uses the public URL and key and the shared cookie name", async () => {
    const { createClient } = await import("./client");
    expect(createClient()).toBe("browser-client");
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://abc.supabase.co",
      "sb_publishable_test",
      { cookieOptions: { name: "drawtoday-auth" } },
    );
  });
});

describe("server client", () => {
  type CookieStore = Parameters<Awaited<typeof import("./server")>["createClient"]>[0];
  const store = (set = vi.fn()) =>
    ({ getAll: vi.fn(() => [{ name: "a", value: "1" }]), set }) as unknown as CookieStore & {
      set: ReturnType<typeof vi.fn>;
    };

  async function build(cookieStore: CookieStore) {
    const { createClient } = await import("./server");
    createClient(cookieStore);
    const [url, key, options] = createServerClient.mock.calls[0] as unknown as [
      string,
      string,
      {
        cookieOptions: unknown;
        cookies: {
          getAll: () => unknown;
          setAll: (list: { name: string; value: string; options?: object }[]) => void;
        };
      },
    ];
    return { url, key, options };
  }

  it("uses the public URL and key and the shared cookie name", async () => {
    const { url, key, options } = await build(store());
    expect(url).toBe("https://abc.supabase.co");
    expect(key).toBe("sb_publishable_test");
    expect(options.cookieOptions).toEqual({ name: "drawtoday-auth" });
  });

  it("reads the cookies of the request", async () => {
    const { options } = await build(store());
    expect(options.cookies.getAll()).toEqual([{ name: "a", value: "1" }]);
  });

  it("writes refreshed cookies with their options", async () => {
    const cookieStore = store();
    const { options } = await build(cookieStore);
    options.cookies.setAll([{ name: "drawtoday-auth", value: "token", options: { path: "/" } }]);
    expect(cookieStore.set).toHaveBeenCalledWith("drawtoday-auth", "token", { path: "/" });
  });

  it("ignores the error of a Server Component, which cannot set cookies (the proxy refreshes the session)", async () => {
    const cookieStore = store(
      vi.fn(() => {
        throw new Error("Cookies can only be modified in a Server Action or Route Handler");
      }),
    );
    const { options } = await build(cookieStore);
    expect(() => options.cookies.setAll([{ name: "a", value: "b" }])).not.toThrow();
  });
});

describe("public client", () => {
  it("is anonymous: no persisted session, no refresh, no cookies", async () => {
    const { createPublicClient } = await import("./public");
    expect(createPublicClient()).toBe("public-client");
    expect(createSupabaseClient).toHaveBeenCalledWith(
      "https://abc.supabase.co",
      "sb_publishable_test",
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
  });

  it("never uses the service role key", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-secret");
    const { createPublicClient } = await import("./public");
    createPublicClient();
    expect(JSON.stringify(createSupabaseClient.mock.calls)).not.toContain("service-secret");
  });
});
