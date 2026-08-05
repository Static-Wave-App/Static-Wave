import {
  AVATAR_COLORS,
  getAvatarColors,
  getStationAvatar,
  getStationInitials,
} from "../station-avatar";

describe("getStationInitials", () => {
  // These exact pairs appear in the design file, so they pin the rule.
  it.each([
    ["Aurora FM", "AF"],
    ["Casa Bossa", "CB"],
    ["Blue Note Radio", "BN"],
    ["Rive Gauche FM", "RG"],
    ["Smoke & Mirrors", "SM"],
    ["Cool Nights 101.7", "CN"],
    ["Velvet Vinyl", "VV"],
    ["Nova Lounge", "NL"],
    ["Kyoto Ambient", "KA"],
  ])("matches the mockup: %s → %s", (name, expected) => {
    expect(getStationInitials(name)).toBe(expected);
  });

  it("uses the first two letters of a single-word name", () => {
    expect(getStationInitials("Jazzradio")).toBe("JA");
  });

  it("skips leading non-letter tokens", () => {
    expect(getStationInitials("101.7 Cool Nights")).toBe("CN");
    expect(getStationInitials("& Then Some")).toBe("TS");
  });

  it("handles separators other than spaces", () => {
    expect(getStationInitials("Radio-Nova")).toBe("RN");
    expect(getStationInitials("jazz.fm")).toBe("JF");
  });

  it("uppercases lowercase names", () => {
    expect(getStationInitials("blue note")).toBe("BN");
  });

  it("trims surrounding whitespace", () => {
    expect(getStationInitials("  Blue Note  ")).toBe("BN");
  });

  it("falls back for non-latin names", () => {
    expect(getStationInitials("радио Ретро")).toBe("РР");
  });

  it("returns ? for empty or unusable names", () => {
    expect(getStationInitials("")).toBe("?");
    expect(getStationInitials("   ")).toBe("?");
  });
});

describe("getAvatarColors", () => {
  it("is stable for the same seed", () => {
    expect(getAvatarColors("abc")).toBe(getAvatarColors("abc"));
  });

  it("always returns a palette entry", () => {
    for (const seed of ["a", "b", "c", "station-uuid-1", "station-uuid-2"]) {
      expect(AVATAR_COLORS).toContain(getAvatarColors(seed));
    }
  });

  it("spreads across the palette", () => {
    const seeds = Array.from({ length: 60 }, (_, i) => `station-${i}`);
    const used = new Set(seeds.map((s) => getAvatarColors(s)[0]));
    expect(used.size).toBeGreaterThan(1);
  });
});

describe("getStationAvatar", () => {
  const base = { stationuuid: "uuid-1", name: "Blue Note Radio" };

  it("uses an https favicon when present", () => {
    const avatar = getStationAvatar({ ...base, favicon: "https://x.test/a.png" });
    expect(avatar.uri).toBe("https://x.test/a.png");
    expect(avatar.initials).toBe("BN");
  });

  it("falls back when the favicon is empty", () => {
    expect(getStationAvatar({ ...base, favicon: "" }).uri).toBeNull();
  });

  it("rejects http favicons, which iOS blocks under ATS", () => {
    expect(getStationAvatar({ ...base, favicon: "http://x.test/a.png" }).uri).toBeNull();
  });

  it("rejects a bare hostname", () => {
    expect(getStationAvatar({ ...base, favicon: "example.com/a.png" }).uri).toBeNull();
  });

  it("keys colour on uuid so a rename keeps the colour", () => {
    const a = getStationAvatar({ ...base, favicon: "" });
    const b = getStationAvatar({ ...base, name: "Renamed", favicon: "" });
    expect(a.colors).toBe(b.colors);
  });
});
