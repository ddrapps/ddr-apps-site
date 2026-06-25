import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { DangerZone } from '../types/app';
import { sendGuardrailNotification } from './notifications';

export const GEOFENCE_TASK = 'guardrail-geofence-task';

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;

  const payload = data as any;
  const entered = payload?.eventType === Location.GeofencingEventType.Enter;
  const region = payload?.region;

  if (entered && region?.identifier) {
    await sendGuardrailNotification(
      'Guardrail active',
      `You're entering ${region.identifier}. Pause before you spend.`,
      { identifier: region.identifier, url: '/(tabs)/history' }
    );
  }
});

export async function requestGuardrailPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return { ok: false, step: 'foreground' };

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') return { ok: false, step: 'background' };

  return { ok: true };
}

export async function startGuardrailRegions(zones: DangerZone[]) {
  const regions = zones
    .filter((zone) => zone.enabled && typeof zone.latitude === 'number' && typeof zone.longitude === 'number')
    .slice(0, 20)
    .map((zone) => ({
      identifier: zone.label,
      latitude: zone.latitude as number,
      longitude: zone.longitude as number,
      radius: zone.radiusMeters,
      notifyOnEnter: true,
      notifyOnExit: false
    }));

  const started = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (started) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }

  if (regions.length > 0) {
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  }

  return regions.length;
}
