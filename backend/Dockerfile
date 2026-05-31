FROM node:20-alpine AS deps

WORKDIR /backend

COPY /package*.json ./
COPY prisma.config.ts ./
COPY ./src/Infrastructure/Persistence/prisma ./src/Infrastructure/Persistence/prisma
RUN npm install --legacy-peer-deps
RUN node_modules/.bin/prisma generate --config prisma.config.ts


FROM node:20-alpine AS builder
LABEL authors="MSI"

WORKDIR /backend

COPY . .
COPY --from=deps /backend/node_modules ./node_modules
COPY --from=deps /backend/prisma.config.ts ./prisma.config.ts
COPY --from=deps /backend/src/Infrastructure/Persistence/prisma ./src/Infrastructure/Persistence/prisma

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /backend

COPY package.json ./
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=deps /backend/prisma.config.ts ./prisma.config.ts
COPY --from=deps /backend/src/Infrastructure/Persistence/prisma ./src/Infrastructure/Persistence/prisma
COPY --from=builder /backend/dist ./dist
COPY src/API/graphql/schema ./src/API/graphql/schema

# All environment variables are injected at runtime by Railway.
# Set them in Railway service → Variables.

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --config prisma.config.ts && node dist/src/main.js"]
