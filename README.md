# Mikmoni - Mikrotik Hotspot Management

A self-hosted management tool for MikroTik RouterOS hotspot networks. Built with TanStack Start, Bun, and SQLite — ships as a single portable executable (Windows / Linux / macOS) or as a Docker image for server deployments.

## Features

- Hotspot user & voucher management via the RouterOS API
- Works with MikroTik routers running RouterOS 6 or 7
- Runs as a portable executable or a lightweight Docker container
- SQLite storage — no external database required

## Installation

### Desktop (Windows / macOS / Linux)

Download the latest release for your platform from the [Releases page](https://github.com/renomureza/mikmoni/releases). No installation needed — just run the executable. A `data` folder is created next to it on first run.

| Platform              | File                      |
| --------------------- | ------------------------- |
| Windows               | `mikmoni-windows-x64.exe` |
| Linux (glibc)         | `mikmoni-linux-x64`       |
| Linux (musl / Alpine) | `mikmoni-linux-x64-musl`  |
| Linux (ARM64)         | `mikmoni-linux-arm64`     |
| macOS (Intel)         | `mikmoni-macos-x64`       |
| macOS (Apple Silicon) | `mikmoni-macos-arm64`     |

Each release includes a `checksums.txt` — verify your download against it before running.

### Docker (web)

```bash
docker run -d \
  --name mikmoni \
  -p 3000:3000 \
  -v ./data:/app/data \
  --restart unless-stopped \
  ghcr.io/renomureza/mikmoni:latest
```

Or with `docker-compose.yml`:

```yaml
services:
  mikmoni:
    image: ghcr.io/renomureza/mikmoni:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## Configuration

Mikmoni is zero-config by default — an app secret is generated automatically on first run and stored in the `data` directory.

| Env var | Description                | Default |
| ------- | -------------------------- | ------- |
| `PORT`  | Port the server listens on | `3000`  |

## Development

Requirements: [Bun](https://bun.sh) 1.4+

```bash
git clone https://github.com/renomureza/mikmoni.git
cd mikmoni
bun install
bunx drizzle-kit push
bun run dev
```

### Build

```bash
bun run build:client    # build client bundle
bun run build:web       # bundle server entry for web / Docker
bun run build:desktop   # compile standalone executables for all platforms
```

### Release

```bash
bun run release patch   # or minor / major
```

This bumps the version, commits, tags, and pushes to `main`. GitHub Actions takes it from there: builds the executables, creates a GitHub Release with checksums, and publishes the Docker image.
