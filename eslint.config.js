import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import pluginLingui from "eslint-plugin-lingui";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath, { gitignoreResolution: true }),
  globalIgnores(["drizzle"]),
  tseslint.configs.recommended,
  pluginLingui.configs["flat/recommended"],
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
    },
    settings: {
      react: {
        version: "19",
      },
    },
  },
  prettier,
);
