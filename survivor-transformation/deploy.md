# Deploy Guide: Backend on Render (free) + Frontend on Netlify

This project is a monorepo with:
- `backend` (NestJS/Fastify)
- `frontend` (Vite + React)

Use this checklist to deploy quickly and avoid common production issues.

## 0) Prerequisites

1. Push your latest code to GitHub/GitLab.
2. Have a MongoDB database ready (MongoDB Atlas is fine).
3. Create accounts on:
   - [Render](https://render.com/) (backend)
   - [Netlify](https://www.netlify.com/) (frontend)

## 1) Security first (important)

Your local `backend/.env` currently contains real-looking secrets. Before production:

1. Generate a new `JWT_SECRET` (32+ random bytes, base64 or hex).
2. Rotate MongoDB credentials (new DB user/password).
3. Use only rotated values in Render environment variables.
4. Do not commit secrets to git.

## 2) Deploy backend to Render (free web service)

### 2.1 Create the service

1. In Render, click **New +** -> **Web Service**.
2. Connect your repo and select it.
3. Configure:
   - **Name**: `survivor-backend` (or any name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Plan**: `Free`
    - **Build Command**: `npm install --include=dev && npm run build`
     
       Note: Render may set `NODE_ENV=production` which causes npm to skip `devDependencies` (including `@nestjs/cli`). Use `--include=dev` above or set the environment variable `NPM_CONFIG_PRODUCTION=false` in Render so the local `nest` binary is installed for the build.
   - **Start Command**: `npm run start:prod`

Why this works:
- `start:prod` runs `node dist/src/main.js`
- app listens on `0.0.0.0` and uses `PORT` from env in `backend/src/main.ts`

### 2.2 Add backend environment variables

In Render -> Service -> **Environment**, set:

- `NODE_ENV=production`
- `PORT=10000` (Render usually injects `PORT`; this is safe as fallback)
- `JWT_SECRET=<your-rotated-secret>`
- `MONGO_URI=<your-rotated-mongodb-uri>`
- `CORS_ORIGIN=<your-netlify-site-url>`

Example `CORS_ORIGIN`:
- `https://your-app.netlify.app`

If you have a custom domain later, set:
- `CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com`

### 2.3 Deploy + verify backend

1. Click **Manual Deploy** (or push a commit).
2. Wait until status is **Live**.
3. Open:
   - `https://<your-render-service>.onrender.com/api-docs`
4. Confirm API health by hitting any public endpoint from Swagger/API client.

Notes on free tier:
- Service sleeps after inactivity and first request can be slow (cold start).

## 3) Deploy frontend to Netlify

### 3.1 Create site

1. In Netlify, click **Add new site** -> **Import an existing project**.
2. Connect the same repo.
3. Configure build:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 3.2 Add frontend environment variable

In Netlify -> Site settings -> **Environment variables**:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api`

This matches `frontend/src/api/client.ts`, which reads `import.meta.env.VITE_API_URL`.

### 3.3 SPA routing fix (required for React Router)

Because frontend uses client-side routing (`/en/...`, `/bg/...`), direct refresh on nested URLs needs rewrite to `index.html`.

Use either:

Option A (recommended): add `frontend/netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Option B: Netlify UI redirect rule:
- From `/*` to `/index.html` with status `200`

### 3.4 Deploy + verify frontend

1. Trigger deploy.
2. Open your Netlify URL.
3. Test:
   - `/en`
   - `/bg`
   - `/en/rules` and browser refresh
4. Confirm API calls succeed in browser Network tab.

## 4) Connect frontend URL back to backend CORS

After Netlify URL is known:

1. Go to Render backend env vars.
2. Ensure `CORS_ORIGIN` exactly matches Netlify URL (no trailing slash preferred).
3. Redeploy backend service.

If requests fail with CORS errors, this is the first thing to check.

## 5) Ongoing deploy workflow

1. Push to main branch.
2. Netlify auto-builds frontend.
3. Render auto-deploys backend.
4. If env vars change, redeploy the affected service manually.

## 6) Quick production checklist

- [ ] Backend live on Render and `/api-docs` works
- [ ] Frontend live on Netlify
- [ ] `VITE_API_URL` points to Render `/api`
- [ ] `CORS_ORIGIN` includes Netlify domain
- [ ] React Router refresh works on nested routes
- [ ] Secrets rotated and stored only in platform env vars
