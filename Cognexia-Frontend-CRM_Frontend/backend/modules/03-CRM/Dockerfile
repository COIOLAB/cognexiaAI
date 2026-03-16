# =============================================================================
# Build in GitHub Actions (no 10-min Railway timeout). Railway deploys from image.
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 py3-setuptools make g++

COPY package*.json .npmrc tsconfig.json ./

# --ignore-scripts: skip "prepare" (npm run build) until after we copy src
RUN npm install --legacy-peer-deps --ignore-scripts

COPY src ./src
RUN npm run build && npm prune --omit=dev

# =============================================================================
# Production
# =============================================================================
FROM node:20-alpine

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

RUN mkdir -p uploads exports logs && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3003

# PORT from env (Railway injects); start-period 120s for DB connection
HEALTHCHECK --interval=15s --timeout=10s --start-period=120s --retries=5 \
    CMD node -e "const p=process.env.PORT||3003; require('http').get('http://127.0.0.1:'+p+'/api/v1', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
