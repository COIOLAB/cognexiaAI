# Deploy Cognexia Frontend to GitHub (CognexiaAi)

Run these steps **on your machine** (Git needs your GitHub credentials).

---

## 0. "Repository not found" – create the repo first

If you see:

```text
remote: Repository not found.
fatal: repository 'https://github.com/CognexiaAi/Cognexia-Frontend.git/' not found
```

**Create the repository on GitHub:**

1. Go to **https://github.com/new**
2. Sign in as **CognexiaAi** (or the org/user that will own the repo).
3. **Repository name:** `Cognexia-Frontend` (exact spelling; GitHub is case-sensitive).
4. Choose **Public** (or Private).
5. Do **not** add a README, .gitignore, or license (leave it empty).
6. Click **Create repository**.

Then run the push script again (step 2 below). The script clones this repo, copies the frontend into it, and pushes.

**If you ran `git remote add origin` in the main CognexiaAI-ERP folder:**  
That changed the **whole project’s** remote to Cognexia-Frontend. To point the main project back to its own repo (if you have one), run from the project root:

```powershell
cd c:\Users\nshrm\Desktop\CognexiaAI-ERP
git remote set-url origin https://github.com/CognexiaAi/CognexiaAI-ERP.git
```

(Use your real main-repo URL if different.)

---

## 1. One-time: ensure Git can access GitHub

- **HTTPS:** When you run the script, Git may prompt for username/password. Use your GitHub **username** and a **Personal Access Token** (not your password). Create a token: [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) (repo scope).
- **SSH:** If you use SSH keys, use the SSH repo URL instead:  
  `git@github.com:CognexiaAi/Cognexia-Frontend.git`

---

## 2. Push frontend to GitHub

Open **PowerShell** and run:

```powershell
cd c:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend
.\push-frontend-to-github.ps1 -RepoUrl "https://github.com/CognexiaAi/Cognexia-Frontend.git"
```

If you use **SSH**:

```powershell
.\push-frontend-to-github.ps1 -RepoUrl "git@github.com:CognexiaAi/Cognexia-Frontend.git"
```

- The script clones **CognexiaAi/Cognexia-Frontend** into a temp folder, copies the frontend contents, and pushes. **Do not** run `git remote add origin` or `git push` from the main CognexiaAI-ERP folder for the frontend—only run this script from the **frontend** folder.
- If the repo is new and empty, the script will still work (it creates the first commit on `main`).

---

## 3. After the push

- **Vercel:** Connect [vercel.com](https://vercel.com) to `https://github.com/CognexiaAi/Cognexia-Frontend` and create 3 projects with Root Directory = `auth-portal`, `client-admin-portal`, `super-admin-portal`.
- **Docker:** The GitHub Action in this repo will build and push images to `ghcr.io/CognexiaAi/cognexia-auth`, etc., on every push to `main`.

Repo URL used: **https://github.com/CognexiaAi/Cognexia-Frontend**
