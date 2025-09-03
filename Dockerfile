FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy source code
COPY index.ts ./
COPY utils/ ./utils/
COPY tools/ ./tools/

RUN addgroup -g 1001 -S hackmd-mcp && \
    adduser -S hackmd-mcp -u 1001 -G hackmd-mcp

RUN corepack enable pnpm && corepack install

# Install all dependencies (including dev deps for TypeScript compilation)
RUN pnpm install --frozen-lockfile

# Build TypeScript code
RUN pnpm run build

FROM node:22-alpine AS release

RUN addgroup -g 1001 -S hackmd-mcp && \
    adduser -S hackmd-mcp -u 1001 -G hackmd-mcp

WORKDIR /app

# Copy package files and built code
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist/ ./dist/

RUN chown -R hackmd-mcp:hackmd-mcp /app

ENV NODE_ENV=production
ENV TRANSPORT=http

RUN corepack enable pnpm && corepack install

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

USER hackmd-mcp

# Expose port for HTTP transport
EXPOSE 8081

CMD ["node", "dist/index.js"]
