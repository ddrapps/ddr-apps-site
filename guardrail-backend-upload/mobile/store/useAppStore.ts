import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppSettings, DangerZone, Goal, GuardrailEvent } from '../types/app';

type AppState = {
  goal: Goal | null;
  dangerZones: DangerZone[];
  events: GuardrailEvent[];
  savedTotal: number;
  streakDays: number;
  settings: AppSettings;
  setGoal: (goal: Goal) => void;
  setDangerZones: (zones: DangerZone[]) => void;
  addDangerZone: (zone: DangerZone) => void;
  removeDangerZone: (zoneId: string) => void;
  addEvent: (event: GuardrailEvent) => void;
  markSkipped: (eventId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetAll: () => void;
};

const defaultSettings: AppSettings = {
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  sensitivity: 'balanced',
  notificationsEnabled: true,
  hasBackgroundLocation: false,
  subscriptionTier: 'free'
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      goal: null,
      dangerZones: [],
      events: [],
      savedTotal: 0,
      streakDays: 0,
      settings: defaultSettings,
      setGoal: (goal) => set({ goal }),
      setDangerZones: (dangerZones) => set({ dangerZones }),
      addDangerZone: (zone) => set((state) => ({ dangerZones: [...state.dangerZones, zone] })),
      removeDangerZone: (zoneId) => set((state) => ({ dangerZones: state.dangerZones.filter((zone) => zone.id !== zoneId) })),
      addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 50) })),
      markSkipped: (eventId) => {
        const current = get().events.find((event) => event.id === eventId);
        set((state) => ({
          events: state.events.map((event) => event.id === eventId ? { ...event, outcome: 'skipped' } : event),
          savedTotal: state.savedTotal + (current?.predictedSpend ?? 0),
          streakDays: state.streakDays + 1
        }));
      },
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetAll: () => set({ goal: null, dangerZones: [], events: [], savedTotal: 0, streakDays: 0, settings: defaultSettings })
    }),
    {
      name: 'guardrail-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
