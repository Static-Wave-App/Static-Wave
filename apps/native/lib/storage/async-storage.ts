import AsyncStorage from "@react-native-async-storage/async-storage";

import type { FavoriteStation, RecentStation, Station } from "@static-wave/types";
import { STORAGE_KEYS } from "@static-wave/types";

export async function getFavorites(): Promise<FavoriteStation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
  if (!raw) return [];
  return JSON.parse(raw) as FavoriteStation[];
}

export async function addFavorite(station: Station): Promise<void> {
  const favorites = await getFavorites();
  const exists = favorites.some((f) => f.stationuuid === station.stationuuid);
  if (exists) return;
  const favorite: FavoriteStation = { ...station, addedAt: Date.now() };
  favorites.unshift(favorite);
  await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export async function removeFavorite(uuid: string): Promise<void> {
  const favorites = await getFavorites();
  const filtered = favorites.filter((f) => f.stationuuid !== uuid);
  await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}

export async function isFavorite(uuid: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.stationuuid === uuid);
}

const MAX_RECENTLY_PLAYED = 50;

export async function getRecentlyPlayed(): Promise<RecentStation[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
  if (!raw) return [];
  return JSON.parse(raw) as RecentStation[];
}

export async function addToRecentlyPlayed(station: Station): Promise<void> {
  const recent = await getRecentlyPlayed();
  const filtered = recent.filter((r) => r.stationuuid !== station.stationuuid);
  const entry: RecentStation = { ...station, playedAt: Date.now() };
  filtered.unshift(entry);
  const trimmed = filtered.slice(0, MAX_RECENTLY_PLAYED);
  await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(trimmed));
}

export async function clearRecentlyPlayed(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify([]));
}