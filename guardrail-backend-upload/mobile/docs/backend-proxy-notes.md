# Backend Proxy Notes

## What changed
The app no longer needs to call Google Places directly from the mobile client. Instead, it can call a backend proxy endpoint and let the serverless function attach the Google Places API key.

## Included
- Netlify Function: `netlify/functions/places-autocomplete.js`
- Netlify config: `netlify.toml`
- Expo config helper: `lib/config.ts`
- Client place search now uses `EXPO_PUBLIC_PLACES_PROXY_URL`
- Seeded fallback results still work when the proxy is not configured

## Environment variables
### Netlify function runtime
- `GOOGLE_PLACES_API_KEY` (set in Netlify site environment variables with Functions scope) [web:89]

### Expo client
- `EXPO_PUBLIC_PLACES_PROXY_URL=https://your-site.netlify.app/.netlify/functions/places-autocomplete`

## Why this is better
Google recommends separate keys per source and restricting API keys, while Expo notes that `EXPO_PUBLIC_` variables are embedded in the client bundle. Moving the Google Places key into the backend proxy avoids shipping the real Google key inside the app. [web:42][web:67][web:81]

## Google request model
Autocomplete (New) uses an HTTP POST request, and Place Details (New) can be fetched from the Places API service using the place identifier returned from autocomplete. [web:20][web:24][web:32][web:95]

## Netlify notes
Netlify documents that environment variables for serverless functions must be set in the Netlify UI, CLI, or API, and to be available at runtime they need Functions scope. Netlify also notes that environment variables declared in `netlify.toml` are not available to serverless functions at runtime. [web:89]

## Deployment flow
1. Deploy the app repo to Netlify.
2. Add `GOOGLE_PLACES_API_KEY` in Netlify environment variables with Functions scope. [web:89]
3. Redeploy the site so the function picks up the variable. [web:89]
4. Set `EXPO_PUBLIC_PLACES_PROXY_URL` in the Expo app to the deployed function URL. [web:67][web:89]
5. Restart the Expo app and test Starbucks search.
