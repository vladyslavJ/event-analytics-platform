# --- Builder ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build reporter

# --- Runner ---
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

# ВИПРАВЛЕНО: Копіюємо у правильну директорію `node_modules`
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Копіюємо зібраний код сервісу
COPY --from=builder /usr/src/app/dist/apps/reporter ./dist/apps/reporter

# Копіюємо схему Prisma, вона потрібна клієнту для роботи
COPY --from=builder /usr/src/app/prisma ./prisma

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/apps/reporter/main.js"]