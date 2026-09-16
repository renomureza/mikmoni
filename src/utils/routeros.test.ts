import { describe, expect, test } from "bun:test";
import { getRouterOSDatePositions } from "./routeros";

describe("getRouterOSDatePositions", () => {
  test("ISO: 2023-05-10", () => {
    const value = "2023-05-10";

    const result = getRouterOSDatePositions(value);

    expect(value.slice(result.year.start, result.year.end)).toBe("2023");
    expect(value.slice(result.month.start, result.month.end)).toBe("05");
    expect(value.slice(result.day.start, result.day.end)).toBe("10");
    expect(result.time.start).toBe(11);
    expect(result.time.end).toBe(19);
    expect(result.separator).toBe("-");
    expect(result.firstSeparatorPosition).toBe(4);
    expect(result.secondSeparatorPosition).toBe(7);
  });

  test("Legacy: may/10/2023", () => {
    const value = "may/10/2023";

    const result = getRouterOSDatePositions(value);

    expect(value.slice(result.month.start, result.month.end)).toBe("may");
    expect(value.slice(result.day.start, result.day.end)).toBe("10");
    expect(value.slice(result.year.start, result.year.end)).toBe("2023");
    expect(result.time.start).toBe(12);
    expect(result.time.end).toBe(20);
    expect(result.separator).toBe("/");
    expect(result.firstSeparatorPosition).toBe(3);
    expect(result.secondSeparatorPosition).toBe(6);
  });

  test("mau/13/20: invalid legacy format should throw error", () => {
    const result = () => getRouterOSDatePositions("mau/13/20");

    expect(result).toThrowError();
  });
});
