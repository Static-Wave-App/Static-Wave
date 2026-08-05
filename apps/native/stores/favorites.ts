import * as Haptics from "expo-haptics";
import { create } from "zustand";

import type { FavoriteStation, Station } from "@static-wave/types";

import { api } from "@/lib/api";
import {
  addFavorite as addFavoriteStorage,
  getFavorites,
  removeFavorite as removeFavoriteStorage,
} from "@/lib/storage";

type FavoritesState = {
  favorites: FavoriteStation[];
  hydrated: boolean;
};

type FavoritesActions = {
  hydrate: () => Promise<void>;
  add: (station: Station) => Promise<void>;
  remove: (uuid: string) => Promise<void>;
  isFavorite: (uuid: string) => boolean;
  toggle: (station: Station) => Promise<void>;
};

export const useFavorites = create<FavoritesState & FavoritesActions>((set, get) => ({
  favorites: [],
  hydrated: false,

  hydrate: async () => {
    const favorites = await getFavorites();
    set({ favorites, hydrated: true });
  },

  add: async (station: Station) => {
    await addFavoriteStorage(station);
    const favorites = await getFavorites();
    set({ favorites });

    api.voteForStation(station.stationuuid).catch(() => {});
  },

  remove: async (uuid: string) => {
    await removeFavoriteStorage(uuid);
    const favorites = await getFavorites();
    set({ favorites });
  },

  // Synchronous: reads the already-hydrated array instead of hitting
  // AsyncStorage. Inside components prefer the `useIsFavorite` hook below so
  // the result re-renders when the list changes.
  isFavorite: (uuid: string) => {
    return get().favorites.some((f) => f.stationuuid === uuid);
  },

  // Fires the haptic pulse specified in flows/04. Best-effort — a device
  // without a taptic engine, or with system haptics off, must not break the
  // favorite itself.
  toggle: async (station: Station) => {
    const wasFavorite = get().isFavorite(station.stationuuid);

    Haptics.impactAsync(
      wasFavorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    ).catch(() => {});

    if (wasFavorite) {
      await get().remove(station.stationuuid);
    } else {
      await get().add(station);
    }
  },
}));

/**
 * Subscribes to a single station's favorite status, so a station row
 * re-renders only when its own entry is added or removed.
 */
export function useIsFavorite(uuid: string): boolean {
  return useFavorites((s) => s.favorites.some((f) => f.stationuuid === uuid));
}
