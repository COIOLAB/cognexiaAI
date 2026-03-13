# Deploy CRM from Pre-built Docker Image (GitHub Actions + GHCR)

Railway's build times out after ~10 min. This setup builds the image in **GitHub Actions** (no timeout) and deploys from **GHCR**.

---

## Step 1: First run – build the image

1. Push this code to your repo (e.g. `CognexiaAi/cognexia-crm-backend`).
2. Go to **Actions** and run the workflow manually, or push to `main`.
3. The workflow will build the Docker image and push it to GHCR.
4. After it runs once, the image will exist at: `ghcr.io/CognexiaAi/cognexia-crm-backend:latest`

---

## Step 2: Make the GHCR image public

Railway Hobby/Pro plans only support **public** images.

1. Go to: **https://github.com/orgs/CognexiaAi/packages**
2. Find `cognexia-crm-backend`
3. **Package settings** → **Change visibility** → **Public**

---

## Step 3: Switch Railway to use the image

**If you already have a CRM Backend service:**

1. **Railway Dashboard** → **CRM Backend** → **Settings**
2. **Source** → **Disconnect** the GitHub repo
3. **Add Source** → **Docker Image**
4. Image: `ghcr.io/CognexiaAi/cognexia-crm-backend:latest`

**Or create a new service:**

1. **Add Service** → **Docker Image**
2. Image: `ghcr.io/CognexiaAi/cognexia-crm-backend:latest`
3. Add your environment variables (copy from existing service)

---

## Step 4: Auto-redeploy (optional)

1. **Railway** → **Account** → **Tokens** → Create token
2. **GitHub** → **Repo** → **Settings** → **Secrets** → Add `RAILWAY_TOKEN`
3. The workflow will run `railway redeploy` after pushing the image (requires `railway link` in the repo)

Or trigger **Redeploy** manually in Railway after each Actions run.

---

## Step 5: Deploy flow

1. Push to `main` → GitHub Actions builds → pushes to GHCR
2. Railway redeploys (auto or manual) → pulls new image
3. No build on Railway → no timeout
