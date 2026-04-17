FROM node:18-alpine

# Instalación de dependencias mínimas de seguridad
RUN apk add --no-cache tzdata

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Crear usuario no privilegiado y asignar permisos
RUN addgroup -S predigroup && adduser -S prediver -G predigroup && \
    chown -R prediver:predigroup /app

# Cambiar a usuario no root
USER prediver

# El puerto 8080 es el estándar para AWS App Runner
EXPOSE 8080

# Salud del contenedor (Opcional pero recomendado)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/server.js"]