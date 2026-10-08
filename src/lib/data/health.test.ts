import { beforeEach, describe, expect, it, vi } from "vitest";
import { pingDatabase } from "./health";

const rpc = vi.fn();
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => ({ rpc }) }));

beforeEach(() => vi.clearAllMocks());

describe("pingDatabase", () => {
  it("calls the keep_alive function and reports success", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await pingDatabase()).toBe(true);
    expect(rpc).toHaveBeenCalledWith("keep_alive");
  });

  it("reports failure when the database answers with an error", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await pingDatabase()).toBe(false);
  });

  it("reports failure when the answer is not the expected one", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await pingDatabase()).toBe(false);
  });

  it("never throws when the network is down", async () => {
    rpc.mockRejectedValue(new Error("network"));
    expect(await pingDatabase()).toBe(false);
  });
});
