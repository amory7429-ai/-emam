// Auth store — bridges Firebase Auth to Zustand for app-wide access
// Stores: user profile, auth state, user-specific settings

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  profile: AuthUserProfile | null;
  isLoaded: boolean;
  setProfile: (profile: AuthUserProfile | null) => void;
  clearProfile: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      profile: null,
      isLoaded: false,
      setProfile: (profile) => set({ profile, isLoaded: true }),
      clearProfile: () => set({ profile: null, isLoaded: true }),
    }),
    {
      name: 'emam-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
