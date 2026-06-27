# Tellava backend

This is a Render-compatible Node + TypeScript + Express backend.

## Render settings

- Root Directory: `apps/tellava-backend` (or the folder where you place this directory)
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

## Environment variables

Add these in Render:

- `PORT=10000`
- `NODE_ENV=production`
- `APP_ORIGIN=https://ddrapps.ca`
- `GOOGLE_PLACES_API_KEY=your-real-key`

## Local run

```bash
npm install
npm run build
npm run start
```

## Health check

- `/`
- `/api/health`
