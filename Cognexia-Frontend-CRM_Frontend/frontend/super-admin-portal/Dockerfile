# Super Admin Portal - Dockerfile (optional; use for Docker-based deployment, not required for Vercel)
# Build from repo root: docker build -f frontend/super-admin-portal/Dockerfile -t cognexia-super-admin .

FROM node:20-alpine

WORKDIR /app
# Copy shared-ui and portal (required for @cognexia/shared-ui file:../shared-ui)
COPY frontend/shared-ui/ frontend/shared-ui/
COPY frontend/super-admin-portal/ frontend/super-admin-portal/

WORKDIR /app/frontend/super-admin-portal
RUN npm ci --omit=dev
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
EXPOSE 3001
CMD ["npm", "start"]
