import { create } from "zustand";

import type { FavoriteStation, Station } from "@static-wave/types";

import {
  addFavorite as addFavoriteStorage,
  getFavorites,
  isFavorite,
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
  isFavorite: (uuid: string) => Promise<boolean>;
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
  },

  remove: async (uuid: string) => {
    await removeFavoriteStorage(uuid);
    const favorites = await getFavorites();
    set({ favorites });
  },

  isFavorite: async (uuid: string) => {
    return isFavorite(uuid);
  },
}));