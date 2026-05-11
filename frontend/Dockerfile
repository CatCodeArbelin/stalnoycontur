FROM node:lts-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:lts-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:lts-alpine AS runner
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
