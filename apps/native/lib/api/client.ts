import type { Station as ApiStation } from "radio-browser-api";
import { RadioBrowserApi } from "radio-browser-api";

import type { Station } from "@static-wave/types";

export const api = new RadioBrowserApi("static-wave/1.0.0");

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