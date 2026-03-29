FROM node:22-slim AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY client/package*.json ./client/

WORKDIR /app/client
RUN npm install --include=dev

COPY client/ ./
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder --chown=node:node /app/client/dist ./dist

# Provide runtime scripts so Railway start command overrides using npm still work.
RUN printf '%s\n' \
	'{' \
	'  "name": "client-runtime",' \
	'  "private": true,' \
	'  "scripts": {' \
	'    "start": "serve -s dist -l ${PORT:-4173}",' \
	'    "prod": "serve -s dist -l ${PORT:-4173}"' \
	'  }' \
	'}' > /app/package.json

USER node
EXPOSE 4173

CMD ["npm", "run", "start"]