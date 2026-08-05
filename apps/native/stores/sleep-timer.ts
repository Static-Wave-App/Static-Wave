import { create } from "zustand";

import { getSleepTimer, setSleepTimer as setSleepTimerStorage } from "@/lib/storage";

type SleepTimerState = {
  endTime: number | null;
  isActive: boolean;
  remainingSeconds: number;
};

type SleepTimerActions = {
  hydrate: () => void;
  set: (durationMinutes: number) => void;
  cancel: () => void;
  /**
   * Recomputes `remainingSeconds` from the absolute `endTime`. Returns true on
   * the tick where the timer expires so the caller can stop playback. Driven by
   * `startSleepTimerService` — see lib/services/sleep-timer-service.ts.
   */
  tick: () => boolean;
  getRemainingSeconds: () => number;
};

function secondsUntil(endTime: number): number {
  return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

export const useSleepTimer = create<SleepTimerState & SleepTimerActions>((set, get) => ({
  endTime: null,
  isActive: false,
  remainingSeconds: 0,

  hydrate: () => {
    const stored = getSleepTimer();
    if (stored.endTime && stored.endTime > Date.now()) {
      set({
        endTime: stored.endTime,
        isActive: true,
        remainingSeconds: secondsUntil(stored.endTime),
      });
    } else if (stored.endTime) {
      // Elapsed while the app was closed — clear the stale value.
      setSleepTimerStorage({ endTime: null });
      set({ endTime: null, isActive: false, remainingSeconds: 0 });
    }
  },

  set: (durationMinutes: number) => {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    setSleepTimerStorage({ endTime });
    set({ endTime, isActive: true, remainingSeconds: secondsUntil(endTime) });
  },

  cancel: () => {
    setSleepTimerStorage({ endTime: null });
    set({ endTime: null, isActive: false, remainingSeconds: 0 });
  },

  tick: () => {
    const { endTime } = get();
    if (!endTime) return false;

    const remaining = secondsUntil(endTime);

    if (remaining <= 0) {
      setSleepTimerStorage({ endTime: null });
      set({ endTime: null, isActive: false, remainingSeconds: 0 });
      return true;
    }

    set({ remainingSeconds: remaining });
    return false;
  },

  getRemainingSeconds: () => {
    const { endTime } = get();
    if (!endTime) return 0;
    return secondsUntil(endTime);
  },
}));
