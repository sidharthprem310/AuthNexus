# Deploying AuthNexus

This guide describes how to deploy AuthNexus.

## Recommended: Render.com (Free Tier)

This project is configured for **Render Blueprints**, which automates the setup of the Web Service and Database.

### Steps
1.  **Fork** this repository to your GitHub account (if you haven't already).
2.  Sign up for [Render.com](https://render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will auto-detect `render.yaml`.
6.  Click **Apply**.

Render will:
- created a free PostgreSQL database.
- build the React Frontend.
- deploy the Flask Backend (serving the frontend).

### Manual Deployment (VPS / Docker)

See [README.md](README.md) for Docker instructions.
