// Adhkar counter persistence — stores completion state per dhikr
// Survives refresh, browser restart, PWA restart

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DhikrCount {
  dhikrId: string;
  count: number;
  completed: boolean;
  completedAt?: string;
}

interface AdhkarCounterState {
  counts: Record<string, DhikrCount>;
  increment: (dhikrId: string, target: number) => void;
  reset: (dhikrId: string) => void;
  getCount: (dhikrId: string) => DhikrCount;
  isComplete: (dhikrId: string, target: number) => boolean;
}

export const useAdhkarCounter = create<AdhkarCounterState>()(
  persist(
    (set, get) => ({
      counts: {},

      increment: (dhikrId: string, target: number) => {
        const current = get().counts[dhikrId] || { dhikrId, count: 0, completed: false };
        if (current.completed) return; // Already complete

        const newCount = current.count + 1;
        const isComplete = newCount >= target;

        set((state) => ({
          counts: {
            ...state.counts,
            [dhikrId]: {
              dhikrId,
              count: newCount,
              completed: isComplete,
              completedAt: isComplete ? new Date().toISOString() : undefined,
            },
          },
        }));
      },

      reset: (dhikrId: string) => {
        set((state) => ({
          counts: {
            ...state.counts,
            [dhikrId]: { dhikrId, count: 0, completed: false },
          },
        }));
      },

      getCount: (dhikrId: string) => {
        return get().counts[dhikrId] || { dhikrId, count: 0, completed: false };
      },

      isComplete: (dhikrId: string, target: number) => {
        const c = get().counts[dhikrId];
        return c ? c.count >= target : false;
      },
    }),
    {
      name: 'emam-adhkar-counters',
    }
  )
);
