# --- Builder ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./prisma ./prisma

COPY ./libs/prisma-client ./libs/prisma-client

COPY . .

RUN npx prisma generate

RUN npm run build ttk-collector


# --- Runner ---
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist/apps/ttk-collector ./dist/apps/ttk-collector
COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --omit=dev

CMD ["node", "dist/apps/ttk-collector/main.js"]