import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  sortTailwindcss: {
    functions: ["cn"],
    stylesheet: "./src/styles/app.css",
  },
  ignorePatterns: ["**/*.hbs"],
});
