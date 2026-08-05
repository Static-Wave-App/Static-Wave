/* eslint-disable @typescript-eslint/no-require-imports */

// MMKV is a native module with no JS fallback — back it with a plain Map so
// storage-backed stores are testable.
jest.mock("react-native-mmkv", () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      getString: (key) => (store.has(key) ? store.get(key) : undefined),
      set: (key, value) => store.set(key, value),
      delete: (key) => store.delete(key),
      clearAll: () => store.clear(),
    }),
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-track-player", () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn().mockResolvedValue(undefined),
    updateOptions: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn(),
    getPlaybackState: jest.fn().mockResolvedValue({ state: "idle" }),
  },
  AppKilledPlaybackBehavior: { PausePlayback: "pause" },
  Capability: { Play: "play", Pause: "pause", Stop: "stop" },
  Event: {
    PlaybackActiveTrackChanged: "playback-track-changed",
    PlaybackError: "playback-error",
    RemotePlay: "remote-play",
    RemotePause: "remote-pause",
    RemoteStop: "remote-stop",
    RemoteNext: "remote-next",
    RemotePrevious: "remote-previous",
  },
  State: { Playing: "playing", Paused: "paused" },
  registerPlaybackService: jest.fn(),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({ isConnected: true }),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));
