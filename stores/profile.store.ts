import { ApiError, getProfileById } from '@/lib/http/api';
import type { Profile } from '@/types/profile';
import { create } from 'zustand';

type ProfileState = {
  profile: Profile;
  isLoading: boolean;
  error: string | null;
  setUserName: (newUserName: string) => void;
  resetProfile: () => void;
  fetchProfile: (profileId: string) => Promise<void>;
};

const emptyProfile = {} as Profile;

const useProfile = create<ProfileState>((set) => ({
  profile: emptyProfile,
  isLoading: false,
  error: null,

  setUserName: (newUserName: string) =>
    set((state) => ({ profile: { ...state.profile, userName: newUserName } })),

  resetProfile: () => set({ profile: emptyProfile, error: null, isLoading: false }),

  fetchProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = await getProfileById(profileId);
      set({ profile: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Unable to fetch profile';
      set({ error: message, isLoading: false });
    }
  },
}));

export default useProfile;
