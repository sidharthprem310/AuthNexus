# Deploying AuthNexus

## Option 1: Render.com (Manual Setup - Recommended for Free Tier)
*Use this method if the Blueprint (render.yaml) asks for a credit card.*

### 1. Create the Database
1.  Log in to [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** -> **PostgreSQL**.
3.  **Name**: `authnexus-db`.
4.  **Instance Type**: Free.
5.  Click **Create Database**.
6.  **Copy the "Internal Database URL"** (starts with `postgres://...`). You will need this soon.

### 2. Create the Web Service
1.  Click **New +** -> **Web Service**.
2.  Connect your repository: `sidharthprem310/AuthNexus`.
3.  **Name**: `authnexus-app`.
4.  **Runtime**: Python 3.
5.  **Build Command**: `./build.sh`
6.  **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT --chdir backend run:app`
7.  **Instance Type**: Free.
8.  **Environment Variables** (Click "Advanced" -> "Add Environment Variable"):
    - `PYTHON_VERSION`: `3.11.9`
    - `SECRET_KEY`: (Enter a random string, e.g., `s3cr3t_k3y`)
    - `DATABASE_URL`: (Paste the Internal Database URL from Step 1)
9.  Click **Create Web Service**.

---

## Option 2: Render Blueprint (Automated)
*Note: May require a credit card on file.*
1.  New (+) -> Blueprint.
2.  Connect Repo.
3.  Approve `render.yaml`.

## Option 3: Docker (VPS)
See [README.md](README.md).
