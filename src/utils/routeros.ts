import * as z from "zod/v4-mini";

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

export function formatBytes(bytes: string | number, decimals = 2) {
  const value = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid byte value: "${bytes}"`);
  }

  if (value === 0) return "0 B";

  const unit = 1024;
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

  const i = Math.floor(Math.log(value) / Math.log(unit));
  const size = value / Math.pow(unit, i);

  return `${size.toFixed(decimals)} ${sizes[i]}`;
}

/**
 * @returns {boolean} false (yyyy-mm-dd), true (mmm/dd/yyyy)
 */
function isISORouterOSDate(dateStr: string): boolean {
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

  const separator = isISORouterOSDate(value)
    ? "-"
    : isLegacyRouterOSDate(value)
      ? "/"
      : null;

  if (!separator) {
    throw new Error(`Unrecognized RouterOS date format: "${value}"`);
  }

  const [year, month, day] = value.split(separator);

  const yearStart = 0;
  const yearEnd = yearStart + year.length;

  const monthStart = yearEnd + 1;
  const monthEnd = monthStart + month.length;

  const dayStart = monthEnd + 1;
  const dayEnd = dayStart + day.length;

  return {
    separator: separator,
    year: { start: yearStart, end: yearEnd },
    month: { start: monthStart, end: monthEnd },
    day: { start: dayStart, end: dayEnd },
  };
}
