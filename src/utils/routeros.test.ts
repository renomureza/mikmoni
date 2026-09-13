import { describe, expect, test } from "bun:test";
import { getRouterOSDatePositions } from "./routeros";

describe("getRouterOSDatePositions", () => {
  test("ISO: 2023-05-10", () => {
    const result = getRouterOSDatePositions("2023-05-10");

    expect(result).toEqual({
      separator: "-",
      year: { start: 0, end: 4 },
      month: { start: 5, end: 7 },
      day: { start: 8, end: 10 },
    });
  });

  test("Legacy: may/10/2023", () => {
    const result = getRouterOSDatePositions("may/10/2023");

    expect(result).toEqual({
      separator: "/",
      year: { start: 0, end: 3 },
      month: { start: 4, end: 6 },
      day: { start: 7, end: 11 },
    });
  });

  test("mau/13/20: invalid legacy format should throw error", () => {
    const result = () => getRouterOSDatePositions("mau/13/20");

    expect(result).toThrowError();
  });
});
