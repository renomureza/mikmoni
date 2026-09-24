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
