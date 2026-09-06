FROM node:18-bullseye-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN node ace build --production

FROM node:18-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./
RUN npm ci --omit=dev

EXPOSE 3333
CMD ["sh", "-c", "node ace migration:run --force && node server.js"]
