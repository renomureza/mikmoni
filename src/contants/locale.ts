export const languages = [
  { label: "English", value: "en" },
  { label: "Indonesia", value: "id" },
] as const;
export type Language = (typeof languages)[number]["value"];
export const languageValues = languages.map((lang) => lang.value) as [
  Language,
  ...Language[],
];

export const currencies = [
  { label: "Rupiah (Rp)", value: "IDR" },
  { label: "US Dollar ($)", value: "USD" },
] as const;
export type Currency = (typeof currencies)[number]["value"];
export const currencyValues = currencies.map((lang) => lang.value) as [
  Currency,
  ...Currency[],
];
