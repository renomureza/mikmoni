import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function getAppDataDir(...paths: string[]) {
  let DATA_DIR;

  if (process.env.NODE_ENV === "production") {
    const APP_DIR = path.dirname(process.execPath);
    DATA_DIR = path.join(APP_DIR, "data");
  } else {
    DATA_DIR = path.resolve("data");
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  return path.join(DATA_DIR, ...paths);
}

export function getOrCreateAppSecret() {
  const filepath = getAppDataDir("app-secret.key");

  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath, "utf8").trim();
  }

  const secret = randomBytes(32).toString("hex");
  fs.writeFileSync(filepath, secret);
  return secret;
}
