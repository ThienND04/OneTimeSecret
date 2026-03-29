FROM node:22-slim AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./

WORKDIR /app
RUN npm ci --include=dev

COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 4173

CMD ["sh", "-c", "serve -s dist -l ${PORT:-4173}"]