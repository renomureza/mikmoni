import { defineConfig } from "@lingui/cli";
import { languageValues } from "./src/contants/locale";

export default defineConfig({
  sourceLocale: "en",
  locales: languageValues,
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
});
