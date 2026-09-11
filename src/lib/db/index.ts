import { drizzle } from "drizzle-orm/bun-sqlite";
import { DB_FILE_NAME } from "~/contants/constants";
import * as schema from "./schema";
import { relations } from "./relations";

const db = drizzle(DB_FILE_NAME, { relations: relations });

export { db, schema };
