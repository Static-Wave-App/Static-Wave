import { withRetry } from "../retry";

describe("withRetry", () => {
  it("returns immediately when the call succeeds", async () => {
    const fn = jest.fn().mockResolvedValue("ok");

    await expect(withRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries and succeeds on a later attempt", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue("ok");

    await expect(withRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("makes at most 3 attempts by default (initial + 2 retries)", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("always fails"));

    await expect(withRetry(fn)).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("rethrows the final error rather than swallowing it", async () => {
    const last = new Error("last failure");
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValueOnce(new Error("second"))
      .mockRejectedValueOnce(last);

    await expect(withRetry(fn)).rejects.toBe(last);
  });

  it("honours a custom retry count", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("nope"));

    await expect(withRetry(fn, 0)).rejects.toThrow("nope");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
