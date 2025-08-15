# api/Dockerfile
FROM node:20-alpine
WORKDIR /app

# Instala dependencias solo con manifest (usa lockfile si existe)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copia el código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
