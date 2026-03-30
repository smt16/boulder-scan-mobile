import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { Session } from '@/mocks/auth-session';

const STORAGE_KEY = 'boulderscan_auth_session';

interface AuthState {
  session: Session | null;
  /** False until SecureStore has been read (avoid auth flash). */
  isStorageHydrated: boolean;

  setSession: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isStorageHydrated: false,

  hydrateFromStorage: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw) as Session;
        set({ session, isStorageHydrated: true });
        return;
      }
    } catch {
      // ignore corrupt storage
    }
    set({ session: null, isStorageHydrated: true });
  },

  setSession: async (session) => {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
    set({ session });
  },

  signOut: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ session: null });
  },
}));

export default useAuthStore;
