FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY index.ts ./
COPY utils/ ./utils
COPY tools/ ./tools

RUN addgroup -g 1001 -S hackmd-mcp && \
    adduser -S hackmd-mcp -u 1001 -G hackmd-mcp

RUN corepack enable pnpm && corepack install

RUN pnpm install --frozen-lockfile


FROM node:22-alpine AS release

RUN addgroup -g 1001 -S hackmd-mcp && \
    adduser -S hackmd-mcp -u 1001 -G hackmd-mcp

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist/ ./dist

RUN chown -R hackmd-mcp:hackmd-mcp /app

ENV NODE_ENV=production

RUN corepack enable pnpm && corepack install

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

USER hackmd-mcp

ENTRYPOINT ["node", "/app/dist/index.js"]
