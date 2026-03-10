FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV ROOMRAVEN_DB_PATH=/app/data/roomraven.db

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build \
  && npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]

