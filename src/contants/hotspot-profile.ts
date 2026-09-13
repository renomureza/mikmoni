export const expiredModeOptions = [
  { label: "None", value: null },
  { label: "Remove", value: "rem" },
  { label: "Notice", value: "ntf" },
  { label: "Remove & Record", value: "remc" },
  { label: "Notice & Record", value: "ntfc" },
] as const;

export type ExpiredModeValue = (typeof expiredModeOptions)[number]["value"];
export const expiredModeValues = expiredModeOptions.reduce(
  (acc, curr) => {
    return curr.value ? acc.concat(curr.value) : acc;
  },
  [] as Exclude<ExpiredModeValue, null>[],
) as [Exclude<ExpiredModeValue, null>, ...Exclude<ExpiredModeValue, null>[]];

export function getExpiredModeLabel(expireMode: ExpiredModeValue) {
  return expiredModeOptions.find((opt) => opt.value === expireMode)?.label;
}
