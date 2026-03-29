import { API_ROUTES } from '@/constants/api-routes';
import { create } from 'zustand';
import { Profile } from '@/types/profile';

type ProfileState = {
  profile: Profile;
  isLoading: boolean;
  error: string | null;
  setUserName: (newUserName: string) => void;
  fetchProfile: (profileId: string) => Promise<void>;
};

const useProfile = create<ProfileState>((set) => ({
  // VALUES
  profile: {} as Profile,
  isLoading: false,
  error: null,

  // SETTERS
  setUserName: (newUserName: string) =>
    set((state) => ({ profile: { ...state.profile, userName: newUserName } })),

  // INITIALISER
  fetchProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(API_ROUTES.PROFILE.getById(profileId));
      if (!res.ok) {
        set({
          isLoading: false,
          error: 'Unable to fetch profile',
        });
        return;
      }

      const data = (await res.json()) as Profile;
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}))

export default useProfile;
