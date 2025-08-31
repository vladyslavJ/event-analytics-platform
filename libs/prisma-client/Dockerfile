FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY ./prisma ./prisma

COPY ./libs/prisma-client ./libs/prisma-client

RUN npx prisma generate

# --- Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/libs/prisma-client ./libs/prisma-client
COPY package*.json ./

RUN apk add --no-cache tini

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npx", "prisma", "migrate", "deploy"]
