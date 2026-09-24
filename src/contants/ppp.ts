export const pppServices = [
  "any",
  "pppoe",
  "ovpn",
  "l2tp",
  "pptp",
  "async",
  "sstp",
] as const;
export type PppService = (typeof pppServices)[number];

export const onlyOneOptions = ["default", "yes", "no"] as const;
export type OnlyOne = (typeof onlyOneOptions)[number];
