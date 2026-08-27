// User settings store — persisted in localStorage
// Ready to migrate to Firebase when auth is added

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSettings {
  // Prayer
  calculationMethod: 'egyptian' | 'umm_al_qura' | 'mwl' | 'isna' | 'karachi' | 'jafari' | 'tehran' | 'gulf' | 'kuwait' | 'qatar';
  lat: number | null;
  lng: number | null;
  city: string;
  country: string;

  // Quran
  defaultReciterId: number;
  fontSize: number; // 1-5 scale: 1=small, 2=medium, 3=large, 4=xl, 5=xxl

  // App
  theme: 'dark' | 'light' | 'system';
  hapticFeedback: boolean;

  // Auth (placeholder for Firebase)
  uid: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  calculationMethod: 'egyptian',
  lat: null,
  lng: null,
  city: '',
  country: 'EG',
  defaultReciterId: 7,
  fontSize: 3,
  theme: 'dark',
  hapticFeedback: true,
  uid: null,
  displayName: null,
  email: null,
  photoURL: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'emam-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
