import { formatCountdown, formatRelativeTime } from "../relative-time";

const NOW = new Date("2026-08-04T12:00:00Z").getTime();
const minutes = (n: number) => n * 60 * 1000;
const hours = (n: number) => n * minutes(60);
const days = (n: number) => n * hours(24);

describe("formatRelativeTime", () => {
  it("shows 'just now' under a minute", () => {
    expect(formatRelativeTime(NOW - 30 * 1000, NOW)).toBe("just now");
  });

  it("shows minutes under an hour", () => {
    expect(formatRelativeTime(NOW - minutes(2), NOW)).toBe("2m ago");
    expect(formatRelativeTime(NOW - minutes(59), NOW)).toBe("59m ago");
  });

  it("shows hours under a day", () => {
    expect(formatRelativeTime(NOW - hours(1), NOW)).toBe("1h ago");
    expect(formatRelativeTime(NOW - hours(23), NOW)).toBe("23h ago");
  });

  it("shows 'Yesterday' for exactly one day", () => {
    expect(formatRelativeTime(NOW - days(1), NOW)).toBe("Yesterday");
  });

  it("shows days within the last week", () => {
    expect(formatRelativeTime(NOW - days(3), NOW)).toBe("3d ago");
  });

  it("falls back to a date beyond a week", () => {
    const result = formatRelativeTime(NOW - days(30), NOW);
    expect(result).not.toMatch(/ago|Yesterday/);
  });

  it("treats future timestamps as 'just now' rather than negative output", () => {
    expect(formatRelativeTime(NOW + minutes(5), NOW)).toBe("just now");
  });
});

describe("formatCountdown", () => {
  it("formats under an hour as M:SS", () => {
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(9)).toBe("0:09");
    expect(formatCountdown(90)).toBe("1:30");
    expect(formatCountdown(3599)).toBe("59:59");
  });

  it("formats an hour or more as H:MM:SS", () => {
    expect(formatCountdown(3600)).toBe("1:00:00");
    expect(formatCountdown(5401)).toBe("1:30:01");
  });

  it("clamps negatives to zero", () => {
    expect(formatCountdown(-10)).toBe("0:00");
  });
});
