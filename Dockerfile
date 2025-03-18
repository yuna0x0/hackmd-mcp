FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy only package files first to leverage Docker cache for dependencies
COPY package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm npm install

# Now copy source code (excluding files in .dockerignore)
COPY src/ ./src/
COPY tsconfig*.json ./
# Add any other necessary project files here

# Build the application
RUN npm run build

# Create production image with minimal dependencies
FROM node:22-alpine AS release

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --omit=dev

# Set user to non-root for better security
USER node

# Set health check if applicable
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD node healthcheck.js

ENTRYPOINT ["node", "/app/dist/index.js"]
