#!/usr/bin/env bun
import fs from "fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { $ } from "bun";

const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;

const rootDir = path.join(import.meta.dir, "..");
const releaseFilePatterns = (
  process.env.RELEASE_FILES?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean) ?? []
).join(" ");

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
    default:
      // oxlint-disable-next-line typescript/restrict-template-expressions
      throw new Error(`Unknown type: ${type}`);
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

// Resolve GitHub usernames from commit author emails
// const usernameCache: Record<string, string | null> = {};
const usernameCache: Map<string, string | null> = new Map();
async function resolveUsername(email: string) {
  if (!ghToken || !email) return null;
  if (usernameCache.get(email) !== undefined) return usernameCache.get(email);

  try {
    const res = await fetch(`https://api.github.com/search/users?q=${email}`, {
      headers: { Authorization: `token ${ghToken}` },
    });
    const data = (await res.json()) as { items: { login: string }[] };
    const login = data?.items?.[0]?.login || null;
    usernameCache.set(email, login);
    return login;
  } catch {
    usernameCache.set(email, null);
    return null;
  }
}

// Resolve author from a PR number via GitHub API
const prAuthorCache: Map<string, string | null> = new Map();
async function resolveAuthorForPR(prNumber: string) {
  const authorCached = prAuthorCache.get(prNumber);
  if (authorCached !== undefined) return authorCached;

  if (!ghToken) {
    prAuthorCache.set(prNumber, null);
    return null;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
      { headers: { Authorization: `token ${ghToken}` } },
    );
    const data = await res.json();
    const login = data?.user?.login || null;
    prAuthorCache.set(prNumber, login);
    return login;
  } catch {
    prAuthorCache.set(prNumber, null);
    return null;
  }
}

async function buildChangelog({
  currentVersion,
  newVersion,
}: {
  currentVersion: string;
  newVersion: string;
}) {
  const rawLog = (
    await $`git log v${currentVersion}..v${newVersion} --pretty=format:"%h %ae %s" --no-merges`.text()
  ).trim();

  const typeOrder = [
    "breaking",
    "feat",
    "fix",
    "refactor",
    "chore",
    "test",
    "ci",
  ] as const;
  const typeLabels = {
    breaking: "⚠️ Breaking Changes",
    feat: "Features",
    fix: "Fix",
    refactor: "Refactor",
    chore: "Chore",
    test: "Tests",
    ci: "CI",
  } as const;
  const typeIndex = (t: (typeof typeOrder)[number]) => {
    const i = typeOrder.indexOf(t);
    return i === -1 ? 99 : i;
  };

  // @ts-ignore
  const groups: Record<
    (typeof typeOrder)[number],
    {
      hash: string;
      email: string;
      scope: string;
      message: string;
      prNumber?: string | null;
    }[]
  > = {};
  const commits = rawLog ? rawLog.split("\n") : [];

  for (const line of commits) {
    const match = line.match(/^(\w+)\s+(\S+)\s+(.*)$/);
    if (!match) continue;
    const [, hash, email, subject] = match;

    // Skip release commits
    if (subject?.startsWith("ci: version packages")) continue;

    // Parse conventional commit: type(scope)!: message
    const conventionalMatch = subject?.match(
      /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.*)$/,
    );
    const type = (
      conventionalMatch && conventionalMatch[1] ? conventionalMatch[1] : "other"
    ) as (typeof typeOrder)[number];
    const isBreaking = conventionalMatch ? !!conventionalMatch[3] : false;
    const scope =
      conventionalMatch && conventionalMatch[2] ? conventionalMatch[2] : "";
    const message = (
      conventionalMatch && conventionalMatch[4] ? conventionalMatch[4] : subject
    ) as string;

    // Only include user-facing change types
    if (!["chore", "feat", "fix", "breaking", "refactor"].includes(type)) {
      continue;
    }

    // Extract PR number if present
    const prMatch = message.match(/\(#(\d+)\)/);
    const prNumber = prMatch ? prMatch[1] : null;

    const bucket = isBreaking ? "breaking" : type;
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push({
      hash: hash!,
      email: email!,
      scope,
      message,
      prNumber,
    });
  }

  // Build markdown grouped by conventional commit type
  const sortedTypes = (Object.keys(groups) as (keyof typeof groups)[]).sort(
    (a, b) => typeIndex(a) - typeIndex(b),
  );

  let changelogMd = "";
  for (const type of sortedTypes) {
    const label =
      typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    changelogMd += `### ${label}\n\n`;

    for (const commit of groups[type]) {
      const scopePrefix = commit.scope ? `${commit.scope}: ` : "";
      const cleanMessage = commit.message.replace(/\s*\(#\d+\)/, "");
      const prRef = commit.prNumber ? ` (#${commit.prNumber})` : "";
      const username = commit.prNumber
        ? await resolveAuthorForPR(commit.prNumber)
        : await resolveUsername(commit.email);
      const authorSuffix = username ? ` by @${username}` : "";

      changelogMd += `- ${scopePrefix}${cleanMessage}${prRef} (${commit.hash})${authorSuffix}\n`;
    }

    changelogMd += "\n";
  }

  if (!changelogMd.trim()) {
    changelogMd = "- No changelog entries\n\n";
  }

  return `## Changes

${changelogMd}
`;
}

const bumpType = process.argv[2] as BumpType | undefined;

if (!bumpType || !["patch", "minor", "major"].includes(bumpType)) {
  console.error("Usage: bun run release <patch|minor|major>");
  console.error("Example: bun run release patch");
  process.exit(1);
}

await assertCleanWorkingTree();
await assertOnMainBranch();
await assertUpToDateWithRemote();

const pkgPath = new URL(path.join(rootDir, "package.json"), import.meta.url)
  .pathname;
const pkgText = await Bun.file(pkgPath).text();
const pkg = JSON.parse(pkgText) as { version: string };

const currentVersion = pkg.version;
const newVersion = bumpVersion(currentVersion, bumpType);
const newVersionTag = `v${newVersion}`;

// Make sure the tag doesn't already exist, to avoid duplicates
const existingTags = (await $`git tag -l ${newVersionTag}`.text()).trim();
if (existingTags === newVersionTag) {
  console.error(
    `❌ Tag ${newVersionTag} already exists. This release may have already been run.`,
  );
  process.exit(1);
}

console.log(`Bumping version: ${currentVersion} -> ${newVersion}`);

const updatedPkgText = pkgText.replace(
  /"version":\s*"[^"]+"/,
  `"version": "${newVersion}"`,
);
await Bun.write(pkgPath, updatedPkgText);

await $`git config user.name "github-actions[bot]"`;
await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;

await $`git add package.json`;
await $`git commit -m "ci: version package"`;
await $`git tag ${newVersionTag}`;

console.log(`\nPushing commit & tag to origin...`);
await $`git push origin main`;
await $`git push origin ${newVersionTag}`;

const tmpFile = path.join(tmpdir(), `release-notes-${newVersion}.md`);
fs.writeFileSync(tmpFile, await buildChangelog({ currentVersion, newVersion }));

try {
  await $`gh release create ${newVersionTag} --title "${newVersionTag}" --notes-file ${tmpFile} --latest ${releaseFilePatterns}`;
  console.info(`GitHub release ${newVersionTag} created.`);
} finally {
  fs.unlinkSync(tmpFile);
}
