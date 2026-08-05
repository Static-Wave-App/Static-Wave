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

jest.mock("expo-audio", () => ({
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    replace: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    setActiveForLockScreen: jest.fn(),
    playing: false,
    paused: true,
    isLoaded: true,
    volume: 1,
  })),
}));

jest.mock("expo-asset", () => ({
  Asset: { fromModule: jest.fn(() => ({ uri: "test://artwork.png" })) },
}));

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({ isConnected: true }),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));
