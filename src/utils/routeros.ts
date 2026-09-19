import * as z from "zod/v4-mini";
import { randomInt } from "./number";
import { UserModeValue, UsernameCharacterValue } from "~/contants/hotspot-user";

export const ROUTEROS_RATE_LIMIT_REGEX = /^(\d+[kKmMgG]?)\/(\d+[kKmMgG]?)$/;

export const rateLimitSchema = z
  .string()
  .check(
    z.regex(
      ROUTEROS_RATE_LIMIT_REGEX,
      "Invalid format. Use rx/tx format, e.g. 5M/10M, 512k/1M, or 1G/1G",
    ),
  );

/**
 * @param {string} duration - 3w6d15h29m11s
 */
function parseRouterOSDuration(duration: string) {
  const regex =
    /^(?=.)(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
  const match = duration.trim().match(regex);

  if (!match) {
    throw new Error(`Invalid RouterOS duration format: "${duration}"`);
  }

  const [, w, d, h, m, s] = match;

  const weeks = parseInt(w || "0", 10);
  const days = parseInt(d || "0", 10);
  const hours = parseInt(h || "0", 10);
  const minutes = parseInt(m || "0", 10);
  const seconds = parseInt(s || "0", 10);

  return (
    weeks * 7 * 24 * 3600 +
    days * 24 * 3600 +
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}

function breakdownSeconds(totalSeconds: number) {
  let remaining = totalSeconds;

  const weeks = Math.floor(remaining / (7 * 24 * 3600));
  remaining %= 7 * 24 * 3600;

  const days = Math.floor(remaining / (24 * 3600));
  remaining %= 24 * 3600;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return { weeks, days, hours, minutes, seconds };
}

/**
 * @param {string} duration - 3w6d15h29m11s
 */
export function formatUptime(duration: string) {
  const totalSeconds = parseRouterOSDuration(duration);
  const { weeks, days, hours, minutes, seconds } =
    breakdownSeconds(totalSeconds);

  const pad = (n: number) => String(n).padStart(2, "0");

  const totalHours = weeks * 7 * 24 + days * 24 + hours;
  return `${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatBytes(
  bytes: string | number,
  opts?: { decimals?: number; locale?: string },
) {
  const decimals = opts?.decimals ?? 2;
  const locale = opts?.locale || "en";

  const value = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid byte value: "${bytes}"`);
  }

  if (value === 0) return "0 B";

  const unit = 1024;
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

  const i = Math.floor(Math.log(value) / Math.log(unit));
  const size = value / Math.pow(unit, i);

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(size)} ${sizes[i]}`;
}

export function fromBytes(bytes: number, unit: "mb" | "gb") {
  const exponents = { mb: 2, gb: 3 };
  return bytes / Math.pow(1024, exponents[unit]);
}

export function toBytes(value: number, unit: "mb" | "gb") {
  const units = { mb: 1024 ** 2, gb: 1024 ** 3 };
  return value * units[unit];
}

/**
 * @returns {boolean} false (yyyy-mm-dd), true (mmm/dd/yyyy)
 */
export function isISORouterOSDate(dateStr: string): boolean {
  const isoRegex = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
  return isoRegex.test(dateStr.trim());
}

/**
 * @returns {boolean} true (yyyy-mm-dd), false (mmm/dd/yyyy)
 */
function isLegacyRouterOSDate(dateStr: string): boolean {
  const legacyRegex =
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\/([0-2]\d|3[01])\/\d{4}$/i;
  return legacyRegex.test(dateStr.trim());
}

export function getRouterOSDatePositions(dateStr: string) {
  const value = dateStr.trim();

  const parts = (value: string, separator: string) => {
    const [first, second, third] = value.split(separator);

    const firstStart = 0;
    const firstEnd = firstStart + first.length;

    const secondStart = firstEnd + 1;
    const secondEnd = secondStart + second.length;

    const thirdStart = secondEnd + 1;
    const thirdEnd = thirdStart + third.length;

    const timeStart = thirdEnd + 1;
    const timeEnd = timeStart + "00:00:00".length;

    return [
      [firstStart, firstEnd],
      [secondStart, secondEnd],
      [thirdStart, thirdEnd],
      [timeStart, timeEnd],
    ];
  };

  if (isISORouterOSDate(value)) {
    const separator = "-";
    const [
      [yearStart, yearEnd],
      [monthStart, monthEnd],
      [dayStart, dayEnd],
      [startTime, startEnd],
    ] = parts(value, separator);

    return {
      separator: separator,
      firstSeparatorPosition: value.indexOf(separator),
      secondSeparatorPosition: value.lastIndexOf(separator),
      year: { start: yearStart, end: yearEnd },
      month: { start: monthStart, end: monthEnd },
      day: { start: dayStart, end: dayEnd },
      time: { start: startTime, end: startEnd },
    };
  }

  if (isLegacyRouterOSDate(value)) {
    const separator = "/";
    const [
      [monthStart, monthEnd],
      [dayStart, dayEnd],
      [yearStart, yearEnd],
      [startTime, startEnd],
    ] = parts(value, separator);

    return {
      separator: separator,
      firstSeparatorPosition: value.indexOf(separator),
      secondSeparatorPosition: value.lastIndexOf(separator),
      month: { start: monthStart, end: monthEnd },
      day: { start: dayStart, end: dayEnd },
      year: { start: yearStart, end: yearEnd },
      time: { start: startTime, end: startEnd },
    };
  }

  throw new Error(`Unrecognized RouterOS date format: "${value}"`);
}

//

export function extractOnLoginScriptPutFields(onLoginScript: string) {
  const match = onLoginScript.match(/put\s*\(\s*"([^"]*)"\s*\)/);
  if (!match)
    return {
      expireMode: "",
      price: "",
      validity: "",
      sellingPrice: "",
      lockUser: "",
    };

  const [, expireMode, price, validity, sellingPrice, , lockUser] =
    match[1].split(",");

  return { expireMode, price, validity, sellingPrice, lockUser };
}

//

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const REQUIRED_CATEGORIES: Record<UsernameCharacterValue, string[]> = {
  lower: [LOWER],
  upper: [UPPER],
  upplow: [LOWER, UPPER],
  mix: [LOWER, NUM],
  mix1: [UPPER, NUM],
  mix2: [LOWER, UPPER, NUM],
};

function randomChar(charset: string): string {
  const index = randomInt(0, charset.length - 1);
  return charset[index];
}

function shuffleFisherYates<TValue>(chars: TValue[]): TValue[] {
  const arr = [...chars];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomStringWithGuarantee(
  length: number,
  categories: string[],
): string {
  const fullCharset = categories.join("");
  const result: string[] = [];

  for (const category of categories) {
    result.push(randomChar(category));
  }

  for (let i = result.length; i < length; i++) {
    result.push(randomChar(fullCharset));
  }

  return shuffleFisherYates(result).join("");
}

export function generateHotspotUserCredential({
  prefix = "",
  length,
  mode,
  character,
}: {
  prefix?: string;
  length: number;
  mode: UserModeValue;
  character: UsernameCharacterValue;
}): { username: string; password: string } {
  const categories = REQUIRED_CATEGORIES[character];

  const randomPart = randomStringWithGuarantee(length, categories);
  const username = `${prefix}${randomPart}`;

  const password =
    mode === "vc"
      ? username
      : `${prefix}${randomStringWithGuarantee(length, categories)}`;

  return { username, password };
}
