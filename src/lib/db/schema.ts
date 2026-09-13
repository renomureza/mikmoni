import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const routeros = sqliteTable("routeros", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  host: text().notNull(),
  port: int().notNull(),
  user: text().notNull().unique(),
  password: text().notNull(),
  tls: int({ mode: "boolean" }).notNull().default(false),
});

export type Routeros = typeof routeros.$inferSelect;
