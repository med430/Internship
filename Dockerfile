FROM node:20-alpine AS deps

WORKDIR /frontend

COPY package*.json ./
RUN npm ci


FROM node:20-alpine AS builder
LABEL authors="MSI"

WORKDIR /frontend

# ALL NEXT_PUBLIC_* vars must be declared here as ARG + ENV.
# Next.js bakes them into the JS bundle during `npm run build`.
# Railway passes all service variables as build args automatically.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URL_WS
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_REDIRECT_URL
ARG NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL_WS=$NEXT_PUBLIC_API_URL_WS
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_REDIRECT_URL=$NEXT_PUBLIC_SUPABASE_REDIRECT_URL
ENV NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL=$NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL

COPY . .
COPY --from=deps /frontend/node_modules ./node_modules

# CACHE_BUST — increment in Railway variables to force a fresh build.
ARG CACHE_BUST=5
RUN echo "cache bust: $CACHE_BUST"

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /frontend

COPY package.json ./
COPY --from=builder /frontend/public ./public
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/node_modules ./node_modules

# All environment variables are injected at runtime by Railway.
# Set them in Railway service → Variables.

CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
