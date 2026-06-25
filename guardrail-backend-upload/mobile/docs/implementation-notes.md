# Implementation Notes

## Current state
This pass adds a real place-selection layer to the onboarding flow and uses a Starbucks example for the coffee danger zone path.

## Added in this pass
- New place search utility with seeded place results
- Starbucks example results for coffee testing
- New onboarding screen for selecting a real place after category choice
- Updated 5-step onboarding progress flow
- Permission screen now references the selected place
- Home screen now displays the selected protected place

## Why this matters
The app now feels closer to the intended product: the user does not just choose a category like coffee shops, they choose a concrete place to guard. That makes geofence setup and intervention copy more believable for MVP testing.

## Remaining work
- Replace seeded place results with real Places API or MapKit/Google Places integration
- Support multiple saved places per category
- Allow map-based radius editing
- Ingest background geofence events into the persisted store more robustly
