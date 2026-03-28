FROM node:22-slim AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm install

FROM node:22-slim AS runner

WORKDIR /app

RUN groupadd --gid 1001 nextjs \
    && useradd --uid 1001 --gid nextjs --shell /bin/bash --create-home nextjs

COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --chown=nextjs:nextjs . .

USER nextjs 
EXPOSE 5173

CMD ["npm", "run", "prod"]