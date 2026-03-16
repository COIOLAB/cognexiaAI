# Auth Portal - Dockerfile (optional; use for Docker-based deployment, not required for Vercel)
# Build from repo root: docker build -f frontend/auth-portal/Dockerfile -t cognexia-auth .

FROM node:20-alpine

WORKDIR /app
COPY frontend/auth-portal/package.json frontend/auth-portal/package-lock.json* ./
RUN npm ci --omit=dev
COPY frontend/auth-portal/ .
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"
EXPOSE 3010
CMD ["npm", "start"]
