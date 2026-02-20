# KodBank Deployment Guide – Option A

Deploy the full-stack KodBank app (frontend + backend) together so the backend serves both the API and the React app. All requests are same-origin, so cookies and CORS work without extra config.

---

## Prerequisites

- Git repository with the KodBank code
- Aiven MySQL database
- Account on [Render](https://render.com) (or another host)

---

## Step 1: Prepare the database

1. Open your **Aiven Console** and copy the **Service URI** for your MySQL instance.
2. Run the schema to create tables:
   - Open the **Aiven MySQL** console (or use `mysql` CLI).
   - Run the SQL in `backend/sql/schema.sql`.

---

## Step 2: Deploy to Render

### 2.1 Create a new Web Service

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New** → **Web Service**.
3. Connect your Git provider and select the KodBank repo.

### 2.2 Configure the service

| Setting | Value |
|--------|--------|
| **Name** | `kodbank` (or any name) |
| **Region** | Choose the region closest to you |
| **Root Directory** | *(leave empty – uses repo root)* |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |

### 2.3 Environment variables

Add these in **Environment**:

| Key | Value | Notes |
|-----|-------|-------|
| `AIVEN_DB_URL` | `mysql://user:pass@host:port/db?ssl-mode=REQUIRED` | Your Aiven MySQL URI |
| `JWT_SECRET` | A strong random string (e.g. 32+ chars) | Used for signing tokens |
| `NODE_ENV` | `production` | Enables production mode |
| `FRONTEND_URL` | `https://your-service-name.onrender.com` | Your Render app URL |

Render sets `PORT` automatically; no need to add it.

### 2.4 Deploy

1. Click **Create Web Service**.
2. Wait for the build and deploy to finish.

---

## Step 3: Set `FRONTEND_URL` after first deploy

1. After the first deploy, note the app URL (e.g. `https://kodbank-xxxx.onrender.com`).
2. Go to **Environment** and add or update:
   - `FRONTEND_URL` = `https://kodbank-xxxx.onrender.com`
3. Trigger a redeploy so the change takes effect.

---

## Step 4: Verify deployment

1. Open your app URL in the browser.
2. Register a new user.
3. Log in and check balance.

---

## What the build does

- **`npm run build`**
  - Installs and builds the frontend (`frontend/dist`)
  - Installs backend dependencies
- **`npm run start`**
  - Starts the backend
  - In production, serves `frontend/dist` and handles client-side routing

---

## Deploying to Railway, Fly.io, or similar

Use the same commands and env vars:

- **Build:** `npm run build`
- **Start:** `npm run start`

Set:

- `AIVEN_DB_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL` = your deployed app URL

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| "Missing AIVEN_DB_URL" | Add `AIVEN_DB_URL` in the environment variables |
| Blank page or 404 | Check that `FRONTEND_URL` is your app URL and matches the backend URL for same-origin |
| "Table doesn't exist" | Run `backend/sql/schema.sql` in your Aiven MySQL database |
| Login/register fails | Ensure CORS `origin` matches `FRONTEND_URL`; for same-origin (Option A), set `FRONTEND_URL` to your app’s public URL |
