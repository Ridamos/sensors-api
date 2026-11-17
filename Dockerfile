# Образ серверного застосунку (NestJS). Збирається у два етапи:
# у першому є все для збирання, у другий потрапляє лише те, що потрібне для запуску.

# ---------- Етап 1: збирання ----------
FROM node:22-slim AS build
WORKDIR /app

# Спершу лише опис залежностей. Поки ці два файли не змінилися, Docker бере
# встановлені пакети з кешу і не завантажує їх наново після кожної правки коду.
COPY package.json package-lock.json ./
# npm ci ставить рівно ті версії, що записані в package-lock.json.
RUN npm ci --legacy-peer-deps

# Тепер код. TypeScript компілюється в JavaScript у папку dist.
COPY . .
RUN npm run build

# Компілятор, лінтер і тести для роботи сервера не потрібні — прибираємо їх.
RUN npm prune --omit=dev --legacy-peer-deps

# ---------- Етап 2: запуск ----------
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Не від імені root: користувач node уже є в образі.
USER node

# Порт, який слухає сервер усередині контейнера (змінна PORT, типово 3000).
EXPOSE 3000

# Параметри бази (DB_HOST, DB_USERNAME, …) в образ не записані:
# їх передає docker-compose.yml під час запуску контейнера.
CMD ["node", "dist/main"]
