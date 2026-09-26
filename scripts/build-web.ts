import { cpSync } from "node:fs";

void (async () => {
  cpSync("drizzle", "dist/drizzle", { recursive: true });
  cpSync("voucher-templates", "dist/voucher-templates", { recursive: true });

  const result = await Bun.build({
    entrypoints: ["./scripts/server.ts"],
    target: "bun",
    minify: true,
    outdir: "./dist",
    define: {
      RUNTIME: JSON.stringify("web"),
    },
  });

  if (result.success) {
    console.log(`✅ [web]`);
  } else {
    console.error(`❌ [web]: ${JSON.stringify(result.logs, null, 2)}`);
  }
})();
