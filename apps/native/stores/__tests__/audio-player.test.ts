import { classifyPlaybackError } from "../audio-player";

describe("classifyPlaybackError", () => {
  it("treats network wording as offline", () => {
    for (const message of [
      "Network request failed",
      "network unreachable",
      "Connection reset",
      "The request timed out",
      "ENOTFOUND example.com",
      "ECONNREFUSED",
    ]) {
      expect(classifyPlaybackError(new Error(message))).toEqual({
        error: "No internet connection",
        isOffline: true,
      });
    }
  });

  it("treats other failures as a station problem", () => {
    expect(classifyPlaybackError(new Error("Unsupported codec"))).toEqual({
      error: "Failed to play station",
      isOffline: false,
    });
  });

  it("handles a raw string", () => {
    expect(classifyPlaybackError("network down").isOffline).toBe(true);
    expect(classifyPlaybackError("bad stream").isOffline).toBe(false);
  });

  it("handles a track-player event payload", () => {
    expect(
      classifyPlaybackError({ code: "playback-source", message: "Network error" }),
    ).toEqual({ error: "No internet connection", isOffline: true });
  });

  it("degrades safely on null/undefined", () => {
    expect(classifyPlaybackError(null)).toEqual({
      error: "Failed to play station",
      isOffline: false,
    });
    expect(classifyPlaybackError(undefined).isOffline).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(classifyPlaybackError(new Error("NETWORK FAILURE")).isOffline).toBe(true);
  });
});
