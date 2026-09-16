import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
});
export type User = typeof users.$inferSelect;

export const routeros = sqliteTable("routeros", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  host: text().notNull(),
  port: int().notNull(),
  user: text().notNull(),
  password: text().notNull(),
  tls: int({ mode: "boolean" }).notNull().default(false),
});
export type Routeros = typeof routeros.$inferSelect;

export const voucherTemplates = sqliteTable("voucher_templates", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  source: text().notNull(),
});
export type VoucherTemplate = typeof voucherTemplates.$inferSelect;
