/**
 * `min <= n <= max`
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error("max must be greater than or equal to min");
  }

  const lower = Math.ceil(min);
  const upper = Math.floor(max);

  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

export function formatCurrency(
  value: number,
  opts: { locale: string; currency: string },
) {
  return new Intl.NumberFormat(opts.locale, {
    currency: opts.currency,
    style: "currency",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, opts: { locale: string }) {
  return new Intl.NumberFormat(opts.locale).format(value);
}
