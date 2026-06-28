
export type RiskLevel = 'low' | 'medium' | 'high';

export type StoreProxy = {
  placeId: string;
  chainName: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  defaultSpend: number;
  riskLevel: RiskLevel;
  score: number;
  visitCount?: number;
  monitored?: boolean;
  lastVisitAt?: string | null;
};

export type MonitorRecord = StoreProxy & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
