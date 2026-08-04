import { create } from "zustand";

import { getSleepTimer, setSleepTimer as setSleepTimerStorage } from "@/lib/storage";

type SleepTimerState = {
  endTime: number | null;
  isActive: boolean;
};

type SleepTimerActions = {
  hydrate: () => void;
  set: (durationMinutes: number) => void;
  cancel: () => void;
  getRemainingSeconds: () => number;
};

export const useSleepTimer = create<SleepTimerState & SleepTimerActions>((set, get) => ({
  endTime: null,
  isActive: false,

  hydrate: () => {
    const stored = getSleepTimer();
    if (stored.endTime && stored.endTime > Date.now()) {
      set({ endTime: stored.endTime, isActive: true });
    } else if (stored.endTime) {
      setSleepTimerStorage({ endTime: null });
    }
  },

  set: (durationMinutes: number) => {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    setSleepTimerStorage({ endTime });
    set({ endTime, isActive: true });
  },

  cancel: () => {
    setSleepTimerStorage({ endTime: null });
    set({ endTime: null, isActive: false });
  },

  getRemainingSeconds: () => {
    const { endTime } = get();
    if (!endTime) return 0;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  },
}));