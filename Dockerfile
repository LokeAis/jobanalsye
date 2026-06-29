# ---- Build stage: bygg frontend (Vite) + server-bundle (esbuild) ----
FROM node:20-slim AS build
WORKDIR /app

# Installer alle avhengigheter (inkl. dev) for bygging.
COPY package*.json ./
RUN npm ci

# Kopier resten av koden. .env.production (offentlig Firebase-config) bakes
# inn av Vite her; ekte secrets kommer som runtime-env i Cloud Run.
COPY . .
RUN npm run build

# ---- Runtime stage: kun det som trengs for å kjøre ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Bare produksjonsavhengigheter (server-bundelen er external-linket mot disse).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Den bygde frontend-en + server-bundelen (begge ender i dist/).
COPY --from=build /app/dist ./dist

# Cloud Run injiserer PORT (default 8080); serveren leser process.env.PORT.
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
