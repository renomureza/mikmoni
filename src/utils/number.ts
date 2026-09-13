export function randomInt(
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): number {
  if (min > max) {
    throw new Error("max must be greater than or equal to min");
  }

  const lower = Math.ceil(min);
  const upper = Math.floor(max);

  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}
