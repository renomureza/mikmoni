import path from "node:path";

await (async () => {
  const targets = [
    "bun-windows-x64",

    "bun-darwin-x64",
    "bun-darwin-arm64",

    "bun-linux-x64",
    "bun-linux-x64-musl",
    "bun-linux-arm64",
  ] satisfies Bun.Build.CompileTarget[];

  for (const target of targets) {
    const isWindows = target === "bun-windows-x64";

    const result = await Bun.build({
      entrypoints: ["./scripts/server.ts"],
      compile: {
        target: target,
        outfile: `./dist/bin/mikmoni-${target.replace("bun-", "")}`,
        assets: ["./dist/client", "./drizzle", "./voucher-templates"],
        windows: isWindows
          ? {
              icon: "./public/favicon.ico",
              title: "Mikmoni",
              description: "RouterOS hotspot manager",
              publisher: "Mikmoni",
              version: "0.0.1",
              copyright: `Copyright ${new Date().getFullYear()}`,
            }
          : undefined,
      },
      target: "bun",
      minify: true,
      define: {
        RUNTIME: JSON.stringify("desktop"),
      },
    });

    if (result.success) {
      console.log(`✅ [${target}]: ${path.basename(result.outputs[0].path)}`);
    } else {
      console.error(`❌ [${target}]: ${JSON.stringify(result.logs, null, 2)}`);
    }
  }
})();

// docker run -d \
//   --name mikmoni \
//   -p 3000:3000 \
//   -v ./docker-data/mikmoni:/app/data \
//   -e APP_SECRET="" \
//   mikmoni
