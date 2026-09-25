import { defineConfig } from "drizzle-kit";
import { DB_FILE_NAME } from "~/contants/constants";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_FILE_NAME,
  },
});
