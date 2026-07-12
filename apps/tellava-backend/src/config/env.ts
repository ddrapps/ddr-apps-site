
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 10000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appOrigin: process.env.APP_ORIGIN || '*',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  storeSearchRadiusMeters: Number(process.env.STORE_SEARCH_RADIUS_METERS || 5000),
  visitTriggerMeters: Number(process.env.VISIT_TRIGGER_METERS || 150),
  geofenceTriggerMeters: Number(process.env.GEOFENCE_TRIGGER_METERS || 30)
};
