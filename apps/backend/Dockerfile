FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN npm install
RUN npm run build -w @slooze/shared
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages/shared ./packages/shared
WORKDIR /app/apps/backend
ENV NODE_ENV=production
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
