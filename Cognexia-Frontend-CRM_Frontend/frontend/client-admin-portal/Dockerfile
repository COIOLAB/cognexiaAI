# Client Admin Portal - Dockerfile (optional; use for Docker-based deployment, not required for Vercel)
# Build from repo root: docker build -f frontend/client-admin-portal/Dockerfile -t cognexia-client-admin .

FROM node:20-alpine

WORKDIR /app
# Copy shared-ui and portal (required for @cognexia/shared-ui file:../shared-ui)
COPY frontend/shared-ui/ frontend/shared-ui/
COPY frontend/client-admin-portal/ frontend/client-admin-portal/

WORKDIR /app/frontend/client-admin-portal
RUN npm ci --omit=dev
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
EXPOSE 3002
CMD ["npm", "start"]
