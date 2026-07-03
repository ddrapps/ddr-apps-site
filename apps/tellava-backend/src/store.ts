
import { randomUUID } from 'crypto';
import type { MonitorRecord, RiskLevel, StoreProxy } from './types';

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

const riskBaseScore: Record<RiskLevel, number> = {
  low: 15,
  medium: 45,
  high: 75
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
    riskLevel: input.riskLevel || existing?.riskLevel || 'low',
    score: typeof input.score === 'number' ? input.score : existing?.score ?? riskBaseScore[input.riskLevel || existing?.riskLevel || 'low'],
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

export function setRisk(placeId: string, riskLevel: RiskLevel, fallback?: Partial<StoreProxy>) {
  const existing = monitoredStores.get(placeId);
  const base: StoreProxy = {
    placeId,
    chainName: fallback?.chainName || 'Unknown store',
    address: fallback?.address || 'No address available',
    latitude: fallback?.latitude ?? 0,
    longitude: fallback?.longitude ?? 0,
    category: fallback?.category || 'store',
    defaultSpend: fallback?.defaultSpend ?? 0,
    score: fallback?.score ?? 0,
    riskLevel,
    visitCount: fallback?.visitCount ?? 0,
    monitored: true,
  };
  const record = upsertMonitoredStore(existing ? existing : base);
  record.riskLevel = riskLevel;
  record.score = Math.max(record.score, riskBaseScore[riskLevel], riskBaseScore[riskLevel] + (record.visitCount || 0) * 8);
  record.updatedAt = new Date().toISOString();
  monitoredStores.set(placeId, record);
  return record;
}

export function bumpVisit(placeId: string) {
  const existing = monitoredStores.get(placeId);
  if (!existing) return null;
  const visitCount = (existing.visitCount || 0) + 1;
  let riskLevel: RiskLevel = existing.riskLevel;
  if (visitCount >= 5) riskLevel = 'high';
  else if (visitCount >= 3 && riskLevel === 'low') riskLevel = 'medium';
  const score = Math.min(100, riskBaseScore[riskLevel] + visitCount * 10);
  const updated: MonitorRecord = {
    ...existing,
    visitCount,
    riskLevel,
    score,
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
