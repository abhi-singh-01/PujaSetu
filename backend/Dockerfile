FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
