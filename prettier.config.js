import * as pluginTailwind from "prettier-plugin-tailwindcss";

export default {
  trailingComma: "all",
  tailwindFunctions: ["cn"],
  plugins: [pluginTailwind],
  tailwindStylesheet: "./src/styles/app.css",
};
