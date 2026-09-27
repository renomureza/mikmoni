// #!/usr/bin/env bun
import fs from "fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { $ } from "bun";

const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const currentVersion = process.env.CURRENT_VERSION!;
const newVersion = process.env.NEW_VERSION!;
const releaseFilePatterns = (
  process.env.RELEASE_FILES?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean) ?? []
).join(" ");

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
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
    if (!["breaking", "feat", "refactor", "fix", "chore"].includes(type)) {
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

const tmpFile = path.join(tmpdir(), `release-notes-${newVersion}.md`);
fs.writeFileSync(tmpFile, await buildChangelog({ currentVersion, newVersion }));

try {
  await $`gh release create v${newVersion} --title "v${newVersion}" --notes-file ${tmpFile} --latest ${releaseFilePatterns}`;
  console.info(`GitHub release ${newVersion} created.`);
} finally {
  fs.unlinkSync(tmpFile);
}
