import type { Station } from "@static-wave/types";

import {
  formatBitrate,
  formatCatalogueSize,
  formatCodec,
  formatCollectionSummary,
  formatCompactNumber,
  formatResultCount,
  formatStationSubtitle,
  formatVotes,
  getStationStatus,
  getStationTags,
  getTrendLabel,
  isPopular,
} from "../station-meta";

const NOW = new Date("2026-08-04T12:00:00Z").getTime();

function station(overrides: Partial<Station> = {}): Station {
  return {
    stationuuid: "uuid",
    name: "Test Station",
    url: "",
    urlResolved: "",
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
    ...overrides,
  };
}

describe("getStationStatus", () => {
  it("reports online from lastcheckok", () => {
    expect(getStationStatus(station({ lastcheckok: 1 }), NOW).isOnline).toBe(true);
    expect(getStationStatus(station({ lastcheckok: 1 }), NOW).label).toBe("Online");
  });

  it("reports offline", () => {
    expect(getStationStatus(station({ lastcheckok: 0 }), NOW).label).toBe("Offline");
  });

  it("adds a relative check time", () => {
    const checked = new Date(NOW - 2 * 60 * 60 * 1000).toISOString();
    expect(getStationStatus(station({ lastchecktime: checked }), NOW).checkedLabel).toBe(
      "Checked 2h ago",
    );
  });

  it("returns null checkedLabel when the timestamp is missing or invalid", () => {
    expect(getStationStatus(station({ lastchecktime: "" }), NOW).checkedLabel).toBeNull();
    expect(getStationStatus(station({ lastchecktime: "nonsense" }), NOW).checkedLabel).toBeNull();
  });
});

describe("getTrendLabel", () => {
  it("returns a direction when clicktrend is positive", () => {
    expect(getTrendLabel(station({ clicktrend: 142 }))).toBe("Trending up · +142 today");
  });

  it("returns null when flat or negative, so the badge can be hidden", () => {
    expect(getTrendLabel(station({ clicktrend: 0 }))).toBeNull();
    expect(getTrendLabel(station({ clicktrend: -5 }))).toBeNull();
  });
});

describe("formatResultCount", () => {
  it("marks a full page as open-ended, since the API sends no total", () => {
    expect(formatResultCount(30, true)).toBe("30+ results");
  });

  it("reports an exact count on the last page", () => {
    expect(formatResultCount(12, false)).toBe("12 results");
  });

  it("singularizes", () => {
    expect(formatResultCount(1, false)).toBe("1 result");
  });

  it("handles empty", () => {
    expect(formatResultCount(0, false)).toBe("No results");
  });
});

describe("formatCollectionSummary", () => {
  it("counts stations and distinct countries", () => {
    expect(
      formatCollectionSummary([
        { country: "France" },
        { country: "France" },
        { country: "Japan" },
      ]),
    ).toBe("3 stations · 2 countries");
  });

  it("singularizes both halves", () => {
    expect(formatCollectionSummary([{ country: "France" }])).toBe("1 station · 1 country");
  });

  it("omits the country half when unknown", () => {
    expect(formatCollectionSummary([{ country: "" }])).toBe("1 station");
  });

  it("handles an empty collection", () => {
    expect(formatCollectionSummary([])).toBe("0 stations");
  });
});

describe("number formatting", () => {
  it("formats votes", () => {
    expect(formatVotes(1284)).toBe("1,284 votes");
    expect(formatVotes(1)).toBe("1 vote");
    expect(formatVotes(0)).toBe("0 votes");
  });

  it("treats bitrate 0 as unknown", () => {
    expect(formatBitrate(192)).toBe("192 kbps");
    expect(formatBitrate(0)).toBeNull();
  });

  it("rounds catalogue size down", () => {
    expect(formatCatalogueSize(48_215)).toBe("48,000");
    expect(formatCatalogueSize(999)).toBe("999");
  });

  it("compacts large numbers", () => {
    expect(formatCompactNumber(999)).toBe("999");
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(15_000)).toBe("15K");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
  });

  it("flags popular stations by real vote counts", () => {
    expect(isPopular(station({ votes: 1284 }))).toBe(true);
    expect(isPopular(station({ votes: 12 }))).toBe(false);
  });

  it("normalizes codec", () => {
    expect(formatCodec("mp3")).toBe("MP3");
    expect(formatCodec("")).toBeNull();
  });
});

describe("tags and subtitle", () => {
  it("splits, trims, and title-cases tags", () => {
    expect(getStationTags(station({ tags: "jazz, lounge ,bossa nova" }))).toEqual([
      "Jazz",
      "Lounge",
      "Bossa Nova",
    ]);
  });

  it("respects the limit", () => {
    expect(getStationTags(station({ tags: "a,b,c,d" }), 2)).toHaveLength(2);
  });

  it("builds a 'Genre · Place' subtitle", () => {
    expect(
      formatStationSubtitle(station({ tags: "lounge", state: "Paris", country: "France" })),
    ).toBe("Lounge · Paris, France");
  });

  it("skips missing parts rather than leaving separators", () => {
    expect(formatStationSubtitle(station({ tags: "", country: "France" }))).toBe("France");
    expect(formatStationSubtitle(station({ tags: "jazz", country: "" }))).toBe("Jazz");
  });
});
