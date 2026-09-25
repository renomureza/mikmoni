#!/usr/bin/env bun
import { $ } from "bun";

type BumpType = "patch" | "minor" | "major";

function bumpVersion(version: string, type: BumpType): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(
      `Current version "${version}" is not a pure semver format (x.y.z). Bump it manually in package.json first.`,
    );
  }

  const [, majorStr, minorStr, patchStr] = match;
  const major = Number(majorStr);
  const minor = Number(minorStr);
  const patch = Number(patchStr);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function assertCleanWorkingTree() {
  const status = (await $`git status --porcelain`.text()).trim();
  if (status !== "") {
    console.error(
      "❌ Working tree is not clean. Commit or stash your changes first.\n",
    );
    console.error(status);
    process.exit(1);
  }
}

async function assertOnMainBranch() {
  const branch = (await $`git rev-parse --abbrev-ref HEAD`.text()).trim();
  if (branch !== "main") {
    console.error(
      `❌ You are on branch "${branch}", not "main". Releases must be run from main.`,
    );
    process.exit(1);
  }
}

async function assertUpToDateWithRemote() {
  await $`git fetch origin main`.quiet();
  const local = (await $`git rev-parse HEAD`.text()).trim();
  const remote = (await $`git rev-parse origin/main`.text()).trim();

  if (local !== remote) {
    console.error("❌ Local branch is out of sync with origin/main.");
    console.error(
      '   Run "git pull" first (and make sure CI is green on the latest commit).',
    );
    process.exit(1);
  }
}

async function main() {
  const bumpType = process.argv[2] as BumpType | undefined;

  if (!bumpType || !["patch", "minor", "major"].includes(bumpType)) {
    console.error("Usage: bun run release <patch|minor|major>");
    console.error("Example: bun run release patch");
    process.exit(1);
  }

  await assertCleanWorkingTree();
  await assertOnMainBranch();
  await assertUpToDateWithRemote();

  const pkgPath = new URL("../package.json", import.meta.url).pathname;
  const pkgText = await Bun.file(pkgPath).text();
  const pkg = JSON.parse(pkgText) as { version: string };

  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, bumpType);
  const tag = `v${newVersion}`;

  // Make sure the tag doesn't already exist, to avoid duplicates
  const existingTags = (await $`git tag -l ${tag}`.text()).trim();
  if (existingTags === tag) {
    console.error(
      `❌ Tag ${tag} already exists. This release may have already been run.`,
    );
    process.exit(1);
  }

  console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);

  const updatedPkgText = pkgText.replace(
    /"version":\s*"[^"]+"/,
    `"version": "${newVersion}"`,
  );
  await Bun.write(pkgPath, updatedPkgText);

  await $`git add package.json`;
  await $`git commit -m "chore(release): ${tag}"`;
  await $`git tag ${tag}`;

  console.log(`\nPushing commit and tag ${tag} to origin...`);
  await $`git push origin main`;
  await $`git push origin ${tag}`;

  console.log(`\n✅ Release ${tag} created and pushed successfully.`);
}

main().catch((err) => {
  console.error("❌ Release failed:", err.message ?? err);
  process.exit(1);
});
