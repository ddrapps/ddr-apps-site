
import { randomUUID } from 'crypto';
import type { MonitorRecord, StoreProxy } from './types';

type MonitoringState = {
  enabled: boolean;
  notificationToken?: string | null;
  updatedAt: string;
};

const monitoredStores = new Map<string, MonitorRecord>();
let monitoringState: MonitoringState = {
  enabled: false,
  notificationToken: null,
  updatedAt: new Date().toISOString()
};

export function listMonitoredStores() {
  return Array.from(monitoredStores.values());
}

export function upsertMonitoredStore(input: StoreProxy) {
  const now = new Date().toISOString();
  const existing = monitoredStores.get(input.placeId);
  const record: MonitorRecord = {
    id: existing?.id ?? randomUUID(),
    placeId: input.placeId,
    chainName: input.chainName,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    category: input.category || 'store',
    defaultSpend: typeof input.defaultSpend === 'number' ? input.defaultSpend : 0,
    visitCount: input.visitCount ?? existing?.visitCount ?? 0,
    monitored: true,
    lastVisitAt: existing?.lastVisitAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  monitoredStores.set(record.placeId, record);
  return record;
}

export function setMonitoringEnabled(enabled: boolean, notificationToken?: string | null) {
  monitoringState = {
    enabled,
    notificationToken: notificationToken ?? monitoringState.notificationToken ?? null,
    updatedAt: new Date().toISOString()
  };
  return monitoringState;
}

export function getMonitoringState() {
  return monitoringState;
}

export function bumpVisit(placeId: string) {
  const existing = monitoredStores.get(placeId);
  if (!existing) return null;
  const visitCount = (existing.visitCount || 0) + 1;
  const updated: MonitorRecord = {
    ...existing,
    visitCount,
    lastVisitAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    monitored: true,
  };
  monitoredStores.set(placeId, updated);
  return updated;
}

export function removeMonitoredStore(placeId: string) {
  const existing = monitoredStores.get(placeId);
  if (!existing) return null;

  monitoredStores.delete(placeId);
  return existing;
}
