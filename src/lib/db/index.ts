import { drizzle } from "drizzle-orm/bun-sqlite";
import { DB_FILE_NAME } from "~/contants/constants";
import * as schema from "./schema";
import { relations } from "./relations";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

const sqlite = new Database(DB_FILE_NAME, { create: true });

const db = drizzle({ relations: relations, client: sqlite });

export { db, schema };

export function runMigrations(migrationFolder: string) {
  migrate(db, { migrationsFolder: migrationFolder });
}
