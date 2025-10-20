FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
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

LABEL org.opencontainers.image.title="HackMD MCP"
LABEL org.opencontainers.image.description="A Model Context Protocol server for integrating HackMD's note-taking platform with AI assistants."
LABEL org.opencontainers.image.version="1.5.4"

LABEL org.opencontainers.image.vendor="yuna0x0"
LABEL org.opencontainers.image.authors="yuna0x0 <yuna@yuna0x0.com>"
LABEL org.opencontainers.image.url="https://github.com/yuna0x0/hackmd-mcp"
LABEL org.opencontainers.image.source="https://github.com/yuna0x0/hackmd-mcp"
LABEL org.opencontainers.image.licenses="MIT"

LABEL io.modelcontextprotocol.server.name="io.github.yuna0x0/hackmd-mcp"

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
