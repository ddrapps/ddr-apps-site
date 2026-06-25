export type GoalType = 'vacation' | 'debt' | 'large_purchase';
export type DangerZoneCategory = 'coffee' | 'big_box' | 'fast_food';
export type GuardrailOutcome = 'skipped' | 'spent' | 'dismissed';

export interface Goal {
  id: string;
  type: GoalType;
  label: string;
  targetAmount?: number;
  currentAmount?: number;
}

export interface DangerZone {
  id: string;
  category: DangerZoneCategory;
  label: string;
  latitude?: number;
  longitude?: number;
  radiusMeters: number;
  enabled: boolean;
  identifier?: string;
  address?: string;
}

export interface GuardrailEvent {
  id: string;
  dangerZoneId: string;
  timestamp: string;
  predictedSpend: number;
  message: string;
  outcome?: GuardrailOutcome;
}

export interface AppSettings {
  quietHoursStart: string;
  quietHoursEnd: string;
  sensitivity: 'low' | 'balanced' | 'high';
  notificationsEnabled: boolean;
  hasBackgroundLocation: boolean;
  subscriptionTier: 'free' | 'pro';
}

export interface PlaceResult {
  id: string;
  label: string;
  address: string;
  category: DangerZoneCategory;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}
