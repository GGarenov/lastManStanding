import { describe, it, expect } from "vitest";
import { getCountdownEndDate } from "./comingSoon";

describe("getCountdownEndDate", () => {
  it("uses the World Cup 2026 start (1 March 2027, Bulgarian time)", () => {
    const end = getCountdownEndDate("world-cup-2026");
    expect(end).toBe("2027-03-01T00:00:00+02:00");
    expect(new Date(end).toISOString()).toBe("2027-02-28T22:00:00.000Z");
  });

  it("falls back to World Cup 2026 for unknown / missing / dateless tournaments", () => {
    expect(getCountdownEndDate(null)).toBe("2027-03-01T00:00:00+02:00");
    expect(getCountdownEndDate("nope")).toBe("2027-03-01T00:00:00+02:00");
    expect(getCountdownEndDate("euro-2024")).toBe("2027-03-01T00:00:00+02:00");
  });
});
