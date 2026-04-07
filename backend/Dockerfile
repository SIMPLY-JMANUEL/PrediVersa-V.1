# 🏛️ PREDIVERSA BACKEND - DOCKER PRO STAGE
# Multi-stage build for light & secure images

# -- STAGE 1: Build & Dependencies --
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# -- STAGE 2: Runtime --
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 🛡️ SEGURIDAD: Usuario no-root para prevenir escalada
RUN addgroup -S predigroup && adduser -S prediuser -G predigroup
USER prediuser

# 🛰️ PUERTO INSTITUCIONAL
EXPOSE 3001

# ⚡ VARIABLES BASE
ENV NODE_ENV=production

CMD ["node", "src/app.js"]