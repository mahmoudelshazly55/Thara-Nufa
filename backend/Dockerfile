# ══════════════════════════════════════════════════════════
# Backend Dockerfile - Multi-stage, production ready
# ══════════════════════════════════════════════════════════

# Stage 1: Build & compile TypeScript
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl openssl-dev libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json .
COPY src ./src
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS production
RUN apk add --no-cache openssl libc6-compat curl
RUN addgroup -g 1001 -S nodejs && adduser -S thara -u 1001
WORKDIR /app

# Copy everything needed from builder
COPY --from=builder --chown=thara:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=thara:nodejs /app/dist        ./dist
COPY --from=builder --chown=thara:nodejs /app/prisma      ./prisma

COPY --chown=thara:nodejs package.json .
COPY --chown=thara:nodejs start.sh      .
RUN chmod +x start.sh

USER thara
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1
CMD ["./start.sh"]
