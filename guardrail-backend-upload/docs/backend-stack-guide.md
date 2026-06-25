# Guardrail Full Backend Stack Guide

## Overview
This package includes:
- `mobile/` — the Expo app updated to call your backend
- `server/` — a Node + Express backend that proxies Google Places requests

## Why this stack
A dedicated backend keeps the Google Places API key server-side, lets you add auth and rate limits later, and avoids shipping the real Google key in the mobile bundle. Google recommends separate keys per source, while Expo notes that public env variables are bundled into the client app. [web:40][web:42][web:67][web:81]

## Backend routes
- `GET /health`
- `POST /api/places/autocomplete`

## Backend environment variables
Create `server/.env` from `.env.example`:
```env
PORT=3000
GOOGLE_PLACES_API_KEY=your_google_places_key_here
ALLOWED_ORIGIN=*
```

## Mobile environment variable
In `mobile/.env.local`:
```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

## Local backend run
```bash
cd server
npm install
npm run dev
```

## Local mobile run
```bash
cd mobile
npm install
npx expo start --clear
```

## Suggested deploy target
Render is a simple choice for the Express backend because it supports environment variables, Node web services, and straightforward deploys from Git. Render documents Node/Express deployment via a web service with standard build and start commands, plus environment variable management in the dashboard. [web:121][web:119][web:123]

## Render setup
- New Web Service
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `GOOGLE_PLACES_API_KEY`, `ALLOWED_ORIGIN`

## Test flow
1. Start backend and confirm `/health` returns `{ ok: true }`.
2. Put backend URL into Expo env.
3. Open onboarding in the app.
4. Search `starbucks`.
5. Confirm live results come from backend.
