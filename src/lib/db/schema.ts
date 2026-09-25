import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  username: text().notNull().unique(),
  password: text().notNull(),
});
export type User = typeof users.$inferSelect;

export const routeros = sqliteTable("routeros", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  host: text().notNull(),
  port: int().notNull(),
  username: text().notNull(),
  password: text().notNull(),
  tls: int({ mode: "boolean" }).notNull().default(false),
  hotspotName: text("hotspot_name").notNull(),
  dnsName: text("dns_name").notNull(),
});
export type Routeros = typeof routeros.$inferSelect;

export const voucherTemplates = sqliteTable("voucher_templates", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  source: text().notNull(),
});
export type VoucherTemplate = typeof voucherTemplates.$inferSelect;

export const settings = sqliteTable("settings", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
});
export type Setting = typeof settings.$inferSelect;

export const options = sqliteTable("options", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
});
export type Option = typeof options.$inferSelect;
