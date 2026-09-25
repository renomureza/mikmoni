# ------
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build:web

# ------
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/dist/client ./dist/client
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/dist/server.js ./dist/server.js
COPY --from=builder /app/drizzle ./dist/drizzle
COPY --from=builder /app/voucher-templates ./voucher-templates

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]