import { create } from 'zustand';

export interface UsageRecord {
  monthKey: string;
  date: string;
  prayer: string;
  passageId: string;
  rakah: number;
}

interface UsageState {
  records: UsageRecord[];
  load: () => void;
  addRecord: (record: UsageRecord) => void;
  isUsedThisMonth: (monthKey: string, passageId: string) => boolean;
  getUsedCount: (monthKey: string) => number;
}

function getStorageKey(): string {
  return 'rafiq-imam-usage';
}

function loadFromStorage(): UsageRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(getStorageKey());
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: UsageRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(records));
  } catch {}
}

export const useUsageStore = create<UsageState>((set, get) => ({
  records: [],
  load: () => {
    const records = loadFromStorage();
    set({ records });
  },
  addRecord: (record) => {
    const newRecords = [...get().records, record];
    saveToStorage(newRecords);
    set({ records: newRecords });
  },
  isUsedThisMonth: (monthKey, passageId) => {
    return get().records.some(
      (r) => r.monthKey === monthKey && r.passageId === passageId
    );
  },
  getUsedCount: (monthKey) => {
    return get().records.filter((r) => r.monthKey === monthKey).length;
  },
}));
