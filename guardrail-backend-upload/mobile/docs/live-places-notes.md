# Live Places Integration Notes

## Added
- Google Places Autocomplete (New) request scaffold
- Google Place Details follow-up fetch scaffold
- EXPO_PUBLIC_GOOGLE_PLACES_API_KEY environment variable lookup
- Fallback to seeded results when no API key is configured
- Multi-zone persistence support and zone removal UI
- Notification deep link payload support into history

## Runtime setup
1. Add `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here` to your local environment.
2. Rebuild the app if needed for native config changes.
3. Test place search with `starbucks` from the onboarding search screen.

## Important platform notes
- Geofencing tasks must be defined in top-level scope. [page:1]
- Background location on iOS requires the `location` background mode. [page:1]
- Android supports up to 100 active geofences, while iOS supports up to 20 monitored regions. [page:1]
- On Android 13, notification permission prompt behavior depends on creating a channel first. [page:2]
- Local notifications remain available in Expo Go, but background and advanced notification behavior should be tested in a development build. [page:1][page:2]

## Recommended next runtime test
- Search Starbucks in onboarding
- Select one Calgary Starbucks result
- Accept foreground and background location permissions
- Send a test guardrail from home
- Tap the notification and confirm it deep-links into history
- Add a second zone and verify it appears in settings
