
# tellava-back

Tellava backend for store discovery, monitoring, risk updates, and background location pings.

## Routes
- GET /api/health
- POST /api/nearby-stores
- POST /api/monitor-store
- POST /api/set-risk-ping
- POST /api/location-ping
- GET /api/enable-monitoring
- POST /api/enable-monitoring

## Environment
- PORT=10000
- APP_ORIGIN=*
- GOOGLE_PLACES_API_KEY=your-key
- STORE_SEARCH_RADIUS_METERS=5000
- VISIT_TRIGGER_METERS=300
- GEOFENCE_TRIGGER_METERS=30

## Notes
This build uses in-memory storage for monitored stores, scores, and visit counts. Data resets on restart, so this is suitable for development and flow testing but not durable production storage.
