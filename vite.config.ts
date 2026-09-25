import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import { nitro } from "nitro/vite";
import babel from "@rolldown/plugin-babel";
import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  // build: {
  //   rolldownOptions: {
  //     output: {
  //       codeSplitting: false,
  //     },
  //   },
  // },
  plugins: [
    lingui(),
    tailwindcss(),
    tanstackStart(),
    // nitro({ preset: "bun" }),
    // nitro({ preset: "node" }),
    babel({
      presets: [linguiTransformerBabelPreset()],
    }),
    viteReact(),
  ],
});
