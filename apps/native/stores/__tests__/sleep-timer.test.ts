import { useSleepTimer } from "../sleep-timer";

beforeEach(() => {
  useSleepTimer.getState().cancel();
  jest.useRealTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("sleep timer", () => {
  it("starts inactive", () => {
    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(false);
    expect(state.endTime).toBeNull();
    expect(state.remainingSeconds).toBe(0);
  });

  it("activates with a remaining count when set", () => {
    useSleepTimer.getState().set(30);

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(true);
    expect(state.endTime).not.toBeNull();
    expect(state.remainingSeconds).toBeGreaterThan(1790);
    expect(state.remainingSeconds).toBeLessThanOrEqual(1800);
  });

  it("clears everything on cancel", () => {
    useSleepTimer.getState().set(15);
    useSleepTimer.getState().cancel();

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(false);
    expect(state.endTime).toBeNull();
    expect(state.remainingSeconds).toBe(0);
  });

  it("tick returns false and decrements while the timer is running", () => {
    jest.useFakeTimers();
    useSleepTimer.getState().set(1);

    jest.advanceTimersByTime(20_000);

    expect(useSleepTimer.getState().tick()).toBe(false);
    expect(useSleepTimer.getState().remainingSeconds).toBe(40);
    expect(useSleepTimer.getState().isActive).toBe(true);
  });

  it("tick returns true exactly once on expiry, then deactivates", () => {
    jest.useFakeTimers();
    useSleepTimer.getState().set(1);

    jest.advanceTimersByTime(61_000);

    expect(useSleepTimer.getState().tick()).toBe(true);

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(false);
    expect(state.endTime).toBeNull();
    expect(state.remainingSeconds).toBe(0);

    // Already expired — must not report expiry a second time, or playback
    // would be paused again on every subsequent tick.
    expect(useSleepTimer.getState().tick()).toBe(false);
  });

  it("tick is a no-op when no timer is set", () => {
    expect(useSleepTimer.getState().tick()).toBe(false);
  });

  it("hydrate discards a timer that elapsed while the app was closed", () => {
    jest.useFakeTimers();
    useSleepTimer.getState().set(1);

    jest.advanceTimersByTime(120_000);

    // Simulate a fresh launch reading the persisted value.
    useSleepTimer.getState().hydrate();

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(false);
    expect(state.endTime).toBeNull();
  });

  it("hydrate restores a timer that is still running", () => {
    jest.useFakeTimers();
    useSleepTimer.getState().set(10);

    jest.advanceTimersByTime(60_000);
    useSleepTimer.getState().hydrate();

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(true);
    expect(state.remainingSeconds).toBe(540);
  });
});
