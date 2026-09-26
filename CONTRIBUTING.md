# Contributing to Mikmoni

Thanks for taking the time to contribute! This document covers everything you need to get set up and submit a change.

## Getting started

Requirements: [Bun](https://bun.sh) 1.4+

```bash
git clone https://github.com/renomureza/mikmoni.git
cd mikmoni
bun install
bunx drizzle-kit push
bun run dev
```

## Workflow

1. Fork the repo and create a branch off `main`.
2. Make your changes.
3. Open a pull request against `main`.

Direct pushes to `main` should be avoided — all changes go through a PR, since release notes are generated automatically from merged PRs.

## Pull request title format

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/), since the title is used verbatim in the generated release notes and determines which changelog section your change appears under.

```
<type>: <short, present-tense description>
```

| Type       | Use for                             | Appears in changelog as |
| ---------- | ----------------------------------- | ----------------------- |
| `breaking` | A breaking change                   | ⚠️ Breaking Changes     |
| `feat`     | A new feature                       | Features                |
| `fix`      | A bug fix                           | Fixes                   |
| `chore`    | Maintenance, tooling, misc          | Chore                   |
| `refactor` | Code change with no behavior change | Refactor                |
| `ci`       | CI/workflow changes                 | 🧰 Maintenance          |
| `test`     | Adding or fixing tests              | 🧰 Maintenance          |

Examples:

- `feat: add CPU usage gauge to dashboard`
- `fix: resolve SQLite ENOENT on Windows startup`
- `chore: bump Bun to 1.4.2`

A CI check validates the title format automatically and applies a matching label to your PR — you don't need to add the label yourself.

## Before opening a PR

Run these locally to catch issues before CI does:

```bash
bun run typecheck
bun run fmt:check
bun run lint
bun run build:client && bun run build:web
```

## What CI checks on every PR

- **Typecheck** — `tsc` across the project
- **Format check** — formatting is consistent
- **Lint** — no lint errors
- **Web build** — `build:client` and `build:web` succeed
- **Desktop build** — executables compile for all supported platforms
- **Docker build** — the image builds successfully (not published, just validated)

All checks must pass before a PR can be merged.

## Code style

- Match the formatting enforced by `bun run fmt:check` — don't hand-format around it.
- Code comments, log messages, and error strings should be written in English.
- Keep functions small and prefer explicit types over `any`.
