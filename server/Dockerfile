FROM node:18-slim AS builder

WORKDIR /app

COPY . .
RUN npm install

FROM node:18-slim AS runner

WORKDIR /app

RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs server/src/ ./src

USER nodejs 
EXPOSE 3000

CMD ["npm", "start"]