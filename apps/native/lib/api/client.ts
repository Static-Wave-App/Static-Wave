import type { Station as ApiStation } from "radio-browser-api";
import { RadioBrowserApi } from "radio-browser-api";

import type { Station } from "@static-wave/types";

// `hideBroken` is set on the client so every search/browse/metadata call
// filters out stations RadioBrowser has flagged as dead.
export const api = new RadioBrowserApi("static-wave/1.0.0", true);

/**
 * RadioBrowser's `url` is frequently a playlist file (.pls/.m3u) rather than a
 * stream. `urlResolved` is the actual audio endpoint and is what should be
 * handed to the player. Falls back to `url` when the API hasn't resolved one.
 */
export function getStreamUrl(station: Station): string {
  return station.urlResolved || station.url;
}

export function mapApiStation(s: ApiStation): Station {
  return {
    stationuuid: s.id,
    name: s.name,
    url: s.url,
    urlResolved: s.urlResolved,
    homepage: s.homepage,
    favicon: s.favicon,
    tags: s.tags.join(","),
    country: s.country,
    countrycode: s.countryCode,
    state: s.state,
    language: s.language.join(","),
    codec: s.codec,
    bitrate: s.bitrate,
    lastcheckok: s.lastCheckOk ? 1 : 0,
    lastchecktime: s.lastCheckTime.toISOString(),
    clickcount: s.clickCount,
    clicktrend: s.clickTrend,
    votes: s.votes,
  };
}

export function mapApiStations(stations: ApiStation[]): Station[] {
  return stations.map(mapApiStation);
}