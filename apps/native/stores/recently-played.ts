import { create } from "zustand";

import type { RecentStation, Station } from "@static-wave/types";

import {
  addToRecentlyPlayed as addToRecentlyPlayedStorage,
  clearRecentlyPlayed as clearRecentlyPlayedStorage,
  getRecentlyPlayed,
} from "@/lib/storage";

type RecentlyPlayedState = {
  recentlyPlayed: RecentStation[];
  hydrated: boolean;
};

type RecentlyPlayedActions = {
  hydrate: () => Promise<void>;
  add: (station: Station) => Promise<void>;
  clear: () => Promise<void>;
};

export const useRecentlyPlayed = create<RecentlyPlayedState & RecentlyPlayedActions>(
  (set, get) => ({
    recentlyPlayed: [],
    hydrated: false,

    hydrate: async () => {
      const recentlyPlayed = await getRecentlyPlayed();
      set({ recentlyPlayed, hydrated: true });
    },

    add: async (station: Station) => {
      await addToRecentlyPlayedStorage(station);
      const recentlyPlayed = await getRecentlyPlayed();
      set({ recentlyPlayed });
    },

    clear: async () => {
      await clearRecentlyPlayedStorage();
      set({ recentlyPlayed: [] });
    },
  }),
);