# Dragon Fruit Oasis Deployment

This repo is set up as a pnpm workspace:

- Frontend: Netlify
- Backend API: Render
- Database: Supabase Postgres

## 1. Supabase

1. Create a new Supabase project.
2. In Supabase, open `Project Settings -> Database`.
3. Copy the Postgres connection string and use the transaction/direct connection string for `DATABASE_URL`.
4. Before deploying the backend, push the schema to Supabase from your machine:

```powershell
$env:DATABASE_URL="postgresql://..."
corepack pnpm --filter @workspace/db push
```

## 2. Render Backend

Use the root [render.yaml](/C:/Users/suraj/Downloads/Dragon-Fruit-Oasis%20(1)/Dragon-Fruit-Oasis/render.yaml) blueprint or create the service manually with these values:

- Root Directory: repo root
- Build Command: `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @workspace/api-server build`
- Start Command: `corepack pnpm --filter @workspace/api-server start`
- Health Check Path: `/api/healthz`

Set these environment variables in Render:

- `DATABASE_URL`: your Supabase Postgres connection string
- `CORS_ORIGIN`: your Netlify site URL, for example `https://your-site.netlify.app`
- `PORT`: `3000`

After deploy, your API base URL will look like:

```text
https://dragon-fruit-oasis-api.onrender.com
```

Test:

```text
https://dragon-fruit-oasis-api.onrender.com/api/healthz
```

## 3. Netlify Frontend

Use the root [netlify.toml](/C:/Users/suraj/Downloads/Dragon-Fruit-Oasis%20(1)/Dragon-Fruit-Oasis/netlify.toml) config or create the site manually with these values:

- Base directory: repo root
- Build command: `corepack pnpm --filter @workspace/dragon-fruit-store build`
- Publish directory: `frontened/dragon-fruit-store/dist/public`

Set this environment variable in Netlify:

- `VITE_API_BASE_URL`: your Render API URL, for example `https://dragon-fruit-oasis-api.onrender.com`

Then redeploy the site.

## 4. CORS

Once Netlify gives you the final frontend URL, copy it back into Render:

```text
CORS_ORIGIN=https://your-site.netlify.app
```

If you use a custom domain too, separate multiple origins with commas:

```text
https://your-site.netlify.app,https://yourdomain.com
```

## Important Note About Uploads

The backend currently stores uploaded product images in the local `uploads` folder. Render disks are ephemeral on the free/basic web service setup, so uploaded images can disappear after restarts or redeploys.

If you want persistent product image uploads, the next step is to move image storage to Supabase Storage or another object storage service.
