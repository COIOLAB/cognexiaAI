# Cognexia Frontend (this repo)

This repository contains the **Cognexia AI** frontend apps:

- **auth-portal** – Marketing + login (Next.js)
- **client-admin-portal** – Client/org dashboard (Next.js)
- **super-admin-portal** – Super-admin dashboard (Next.js)
- **shared-ui** – Shared UI library used by client-admin and super-admin

---

## Deploy on Vercel (recommended)

**Vercel builds from this Git repo** (no Docker needed for Vercel).

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import this repo.
2. Create **three projects**, one per app. For each project set **Root Directory**:

   | Portal         | Root Directory        |
   |----------------|------------------------|
   | Auth           | `auth-portal`          |
   | Client Admin   | `client-admin-portal`  |
   | Super Admin    | `super-admin-portal`   |

3. Add **Environment variables** from [`.env.production.example`](./.env.production.example) (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)).
4. Deploy.

---

## Docker images (optional)

Docker images are built and pushed to **GitHub Container Registry (GHCR)** by the [Docker workflow](.github/workflows/docker-build.yml) on every push to `main`/`master`.

- **Vercel does not use these images** – Vercel builds Next.js from source.
- Use the images for **Railway (Docker)**, **ECS**, **Kubernetes**, or **self-hosted**.

After the workflow runs, images are available at:

- `ghcr.io/YOUR_ORG/cognexia-auth:latest`
- `ghcr.io/YOUR_ORG/cognexia-client-admin:latest`
- `ghcr.io/YOUR_ORG/cognexia-super-admin:latest`

**Build locally** (from this repo root):

```powershell
docker build -f auth-portal/Dockerfile -t cognexia-auth .
docker build -f client-admin-portal/Dockerfile -t cognexia-client-admin .
docker build -f super-admin-portal/Dockerfile -t cognexia-super-admin .
```

---

## Syncing from main CognexiaAI-ERP repo

If this repo is a **frontend-only mirror** of a monorepo, use the sync script from the monorepo’s `frontend` folder:

```powershell
cd path\to\CognexiaAI-ERP\frontend
.\push-frontend-to-github.ps1 -RepoUrl "https://github.com/YOUR_ORG/Cognexia-Frontend.git"
```

That script copies the frontend contents here and adjusts Dockerfiles for this repo layout.
