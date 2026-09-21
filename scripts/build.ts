import path from "node:path";

(async () => {
  const targets = [
    "bun-windows-x64",

    "bun-darwin-x64",
    "bun-darwin-arm64",

    "bun-linux-x64",
    "bun-linux-x64-musl",
    "bun-linux-arm64",
  ] satisfies Bun.Build.CompileTarget[];

  for (const target of targets) {
    const result = await Bun.build({
      entrypoints: ["./scripts/server.ts"],
      compile: {
        target: target,
        outfile: `./dist/bin/mikmoni-${target.replace("bun-", "")}${target === "bun-windows-x64" ? ".exe" : ""}`,
        assets: ["./dist/client", "./drizzle"],
        windows:
          target === "bun-windows-x64"
            ? {
                icon: "./public/favicon.ico",
                title: "Mikmoni",
                publisher: "Mikmoni",
                version: "0.0.2",
                copyright: `Copyright ${new Date().getFullYear()}`,
                description: "RouterOS hotspot manager",
              }
            : undefined,
      },
      target: "bun",
      minify: true,
      // bytecode: true,
    });

    if (result.success) {
      console.log(`✅ [${target}]: ${path.basename(result.outputs[0].path)}`);
    } else {
      console.error(`❌ [${target}]: ${JSON.stringify(result.logs, null, 2)}`);
    }
  }
})();
