# Industry 5.0 Finance & Accounting Module - Production Dockerfile
# Multi-stage build for optimized production deployment

# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S finance -u 1001

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=finance:nodejs /app/dist ./dist

# Copy configuration files
COPY --chown=finance:nodejs .env* ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER finance

# Start the application
CMD ["node", "dist/index.js"]

# Metadata
LABEL \
    version="3.0.0" \
    description="Industry 5.0 ERP - Finance & Accounting Module" \
    maintainer="Industry 5.0 ERP Team" \
    org.opencontainers.image.title="Finance & Accounting Module" \
    org.opencontainers.image.description="Advanced Finance & Accounting with AI-powered analytics" \
    org.opencontainers.image.vendor="Industry 5.0" \
    org.opencontainers.image.version="3.0.0"
