export const userModeOptions = [
  {
    label: "Username & Password",
    value: "up",
  },
  {
    label: "Username = Password",
    value: "vc",
  },
] as const;

export type UserModeValue = (typeof userModeOptions)[number]["value"];
export const userModeValues = userModeOptions.map((opt) => opt.value) as [
  UserModeValue,
  ...UserModeValue[],
];

export function getUserModeLabel(mode: UserModeValue) {
  return userModeOptions.find((opt) => opt.value === mode)?.label;
}

export const usernameCharacterOptions = [
  { label: "abcd", value: "lower" },
  { label: "ABCD", value: "upper" },
  { label: "aBcD", value: "upplow" },
  { label: "a1c2", value: "mix" },
  { label: "A1B2", value: "mix1" },
  { label: "a1B2", value: "mix2" },
] as const;
export type UsernameCharacterValue =
  (typeof usernameCharacterOptions)[number]["value"];
export const usernameCharacterValues = usernameCharacterOptions.map(
  (opt) => opt.value,
) as [UsernameCharacterValue, ...UsernameCharacterValue[]];

export const dataLimitUnitOptions = [
  { label: "MB", value: "mb" },
  { label: "GB", value: "gb" },
] as const;
export type DataLimitUnitValue = (typeof dataLimitUnitOptions)[number]["value"];
export const dataLimitUnitValues = dataLimitUnitOptions.map(
  (opt) => opt.value,
) as [DataLimitUnitValue, ...DataLimitUnitValue[]];
