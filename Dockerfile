FROM node:22-slim AS base
WORKDIR /app
RUN npm install -g bun@1.3.9

# Install dependencies
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY apps/website/package.json apps/website/
COPY packages/shared/package.json packages/shared/
COPY apps/backend/prisma/ apps/backend/prisma/
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    bun install --frozen-lockfile
RUN cd apps/backend && \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate

# Build
FROM base AS builder
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
COPY --from=deps /app ./
COPY . .
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN bun run build

# Production
FROM node:22-slim AS runner
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY apps/website/package.json apps/website/
COPY packages/shared/package.json packages/shared/
COPY apps/backend/prisma/ apps/backend/prisma/
RUN npm install -g bun@1.3.9 && \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    bun install --frozen-lockfile --production

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules/.prisma/client ./apps/backend/node_modules/.prisma/client
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/apps/website/dist ./apps/website/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app && \
    chown -R app:app /app
USER app

WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
