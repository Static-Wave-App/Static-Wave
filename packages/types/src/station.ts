export type Station = {
  stationuuid: string;
  name: string;
  url: string;
  urlResolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  codec: string;
  bitrate: number;
  lastcheckok: number;
  lastchecktime: string;
  clickcount: number;
  clicktrend: number;
  votes: number;
};

export type FavoriteStation = Station & {
  addedAt: number;
};

export type RecentStation = Station & {
  playedAt: number;
};