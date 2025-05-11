# 1. Install dependencies (cacheable)
FROM node:21.6.2-alpine AS deps
WORKDIR /app

# Copy lockfiles first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci                               # Install only production & dev deps :contentReference[oaicite:0]{index=0}

# 2. Build the Next.js app
FROM node:21.6.2-alpine AS builder
WORKDIR /app

# Reuse installed deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build                        # Runs `next build`, outputs .next/standalone :contentReference[oaicite:1]{index=1}

# 3. Package only the production output
FROM node:21.6.2-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# (Optional) Disable Next.js telemetry in prod
# ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone build and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Drop privileges
USER nextjs

# Expose the default Next.js port
EXPOSE 3000
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
