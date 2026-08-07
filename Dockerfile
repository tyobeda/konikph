# Multi-stage Dockerfile for Next.js with Prisma & Standalone Output
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# 1. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# 2. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build Next.js standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# 3. Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy full node_modules for Prisma CLI DB push & migrations
COPY --from=deps /app/node_modules ./node_modules

# Startup script: sync database schema then start
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running Prisma DB Push & Migrations..."' >> /app/start.sh && \
    echo 'node /app/node_modules/prisma/build/index.js db push --schema=/app/prisma/schema.prisma --accept-data-loss 2>&1 || echo "DB push skipped or already applied"' >> /app/start.sh && \
    echo 'echo "Starting Next.js server..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

USER nextjs

EXPOSE 3000

CMD ["/app/start.sh"]
