# Multi-stage build for Fieldsy Admin (Next.js)
# ==============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (change rarely - better layer caching)
COPY package.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.js ./
COPY .env.production* ./

# Copy source and public separately (change more often)
COPY src ./src
COPY public ./public

# Environment variables will be read from .env.production automatically by Next.js
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets with correct ownership (avoids extra chown layer that doubles image size)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port (Admin runs on 3003)
EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
