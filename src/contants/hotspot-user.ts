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

export const usernameCharacterOptions = [
  { label: "abcd", value: "alpha_lower" },
  { label: "ABCD", value: "alpha_upper" },
  { label: "aBcD", value: "alpha_lower_upper" },
  { label: "a1c2", value: "alpha_num_lower" },
  { label: "A1B2", value: "alpha_num_upper" },
  { label: "a1B2", value: "alpha_num_lower_upper" },
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
