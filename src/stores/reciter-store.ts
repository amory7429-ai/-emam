'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVAILABLE_RECITERS, getReciterById, type Reciter } from '@/lib/quran/types';

const STORAGE_KEY = 'preferred-reciter-id';
const DEFAULT_RECITER_ID = 7;

export interface ReciterState {
  selectedReciterId: number;
  setReciter: (id: number) => void;
  getSelectedReciter: () => Reciter;
}

export const useReciterStore = create<ReciterState>()(
  persist(
    (set, get) => ({
      selectedReciterId: DEFAULT_RECITER_ID,
      setReciter: (id: number) => set({ selectedReciterId: id }),
      getSelectedReciter: () => getReciterById(get().selectedReciterId) || AVAILABLE_RECITERS[0],
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ selectedReciterId: state.selectedReciterId }),
    }
  )
);