import { create } from "zustand";

import { getSettings, setSettings as setSettingsStorage } from "@/lib/storage";

type SettingsState = {
  instantPlay: boolean;
};

type SettingsActions = {
  hydrate: () => void;
  toggleInstantPlay: () => void;
};

/**
 * User preferences that aren't tied to any one screen. Small on purpose —
 * this is the app's one settings surface, currently just "instant play"
 * (requested directly by a user: tapping a station should start playing it,
 * not just open its details page). Follows the same store shape as
 * useSleepTimer: hydrate on boot, persist via MMKV on every change.
 */
export const useSettings = create<SettingsState & SettingsActions>((set, get) => ({
  instantPlay: false,

  hydrate: () => {
    set(getSettings());
  },

  toggleInstantPlay: () => {
    const next = !get().instantPlay;
    setSettingsStorage({ instantPlay: next });
    set({ instantPlay: next });
  },
}));
