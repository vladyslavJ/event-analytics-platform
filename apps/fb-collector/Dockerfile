# --- Builder ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./prisma ./prisma

COPY ./libs/prisma-client ./libs/prisma-client

COPY . .

RUN npx prisma generate

RUN npm run build fb-collector

# --- Runner ---
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist/apps/fb-collector ./dist/apps/fb-collector
COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --omit=dev

RUN apk add --no-cache tini

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/apps/fb-collector/main.js"]