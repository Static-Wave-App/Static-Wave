import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Station } from "@static-wave/types";

import {
  addFavorite,
  addToRecentlyPlayed,
  clearRecentlyPlayed,
  getFavorites,
  getRecentlyPlayed,
  isFavorite,
  removeFavorite,
} from "../async-storage";

function station(uuid: string, name = `Station ${uuid}`): Station {
  return {
    stationuuid: uuid,
    name,
    url: `https://example.com/${uuid}`,
    urlResolved: `https://example.com/${uuid}/stream`,
    homepage: "",
    favicon: "",
    tags: "",
    country: "",
    countrycode: "",
    state: "",
    language: "",
    codec: "MP3",
    bitrate: 128,
    lastcheckok: 1,
    lastchecktime: "",
    clickcount: 0,
    clicktrend: 0,
    votes: 0,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("favorites", () => {
  it("returns an empty list when nothing is stored", async () => {
    await expect(getFavorites()).resolves.toEqual([]);
  });

  it("adds a favorite with an addedAt timestamp", async () => {
    await addFavorite(station("a"));

    const favorites = await getFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].stationuuid).toBe("a");
    expect(typeof favorites[0].addedAt).toBe("number");
  });

  it("does not duplicate an existing favorite", async () => {
    await addFavorite(station("a"));
    await addFavorite(station("a"));

    await expect(getFavorites()).resolves.toHaveLength(1);
  });

  it("puts newly added favorites first", async () => {
    await addFavorite(station("a"));
    await addFavorite(station("b"));

    const favorites = await getFavorites();
    expect(favorites.map((f) => f.stationuuid)).toEqual(["b", "a"]);
  });

  it("removes by uuid", async () => {
    await addFavorite(station("a"));
    await addFavorite(station("b"));
    await removeFavorite("a");

    const favorites = await getFavorites();
    expect(favorites.map((f) => f.stationuuid)).toEqual(["b"]);
  });

  it("reports membership", async () => {
    await addFavorite(station("a"));

    await expect(isFavorite("a")).resolves.toBe(true);
    await expect(isFavorite("nope")).resolves.toBe(false);
  });
});

describe("recently played", () => {
  it("prepends the newest entry", async () => {
    await addToRecentlyPlayed(station("a"));
    await addToRecentlyPlayed(station("b"));

    const recent = await getRecentlyPlayed();
    expect(recent.map((r) => r.stationuuid)).toEqual(["b", "a"]);
  });

  it("moves a replayed station to the top instead of duplicating it", async () => {
    await addToRecentlyPlayed(station("a"));
    await addToRecentlyPlayed(station("b"));
    await addToRecentlyPlayed(station("a"));

    const recent = await getRecentlyPlayed();
    expect(recent.map((r) => r.stationuuid)).toEqual(["a", "b"]);
    expect(recent).toHaveLength(2);
  });

  it("caps the list at 50 entries, dropping the oldest", async () => {
    for (let i = 0; i < 55; i++) {
      await addToRecentlyPlayed(station(`s${i}`));
    }

    const recent = await getRecentlyPlayed();
    expect(recent).toHaveLength(50);
    expect(recent[0].stationuuid).toBe("s54");
    expect(recent.some((r) => r.stationuuid === "s0")).toBe(false);
  });

  it("records a playedAt timestamp", async () => {
    await addToRecentlyPlayed(station("a"));

    const [entry] = await getRecentlyPlayed();
    expect(typeof entry.playedAt).toBe("number");
  });

  it("clears the list", async () => {
    await addToRecentlyPlayed(station("a"));
    await clearRecentlyPlayed();

    await expect(getRecentlyPlayed()).resolves.toEqual([]);
  });
});
