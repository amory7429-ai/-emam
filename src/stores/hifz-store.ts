// Hifz (memorization) progress store
// Persists memorized/review status per passage

import { create } from 'zustand';

export interface HifzRecord {
  passageId: string;
  date: string;
  status: 'memorized' | 'review';
}

interface HifzState {
  records: HifzRecord[];
  load: () => void;
  markMemorized: (passageId: string) => void;
  markReview: (passageId: string) => void;
  getStatus: (passageId: string) => 'memorized' | 'review' | null;
  removeRecord: (passageId: string) => void;
}

function getStorageKey(): string {
  return 'rafiq-imam-hifz';
}

function loadFromStorage(): HifzRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: HifzRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(records));
  } catch {}
}

export const useHifzStore = create<HifzState>((set, get) => ({
  records: [],
  load: () => {
    const records = loadFromStorage();
    set({ records });
  },
  markMemorized: (passageId) => {
    const existing = get().records.filter(r => r.passageId !== passageId);
    const newRecords = [...existing, { passageId, date: new Date().toISOString(), status: 'memorized' as const }];
    saveToStorage(newRecords);
    set({ records: newRecords });
  },
  markReview: (passageId) => {
    const existing = get().records.filter(r => r.passageId !== passageId);
    const newRecords = [...existing, { passageId, date: new Date().toISOString(), status: 'review' as const }];
    saveToStorage(newRecords);
    set({ records: newRecords });
  },
  getStatus: (passageId) => {
    const record = get().records.find(r => r.passageId === passageId);
    return record?.status || null;
  },
  removeRecord: (passageId) => {
    const newRecords = get().records.filter(r => r.passageId !== passageId);
    saveToStorage(newRecords);
    set({ records: newRecords });
  },
}));
