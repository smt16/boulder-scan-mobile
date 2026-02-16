import { API_ROUTES } from '@/constants/api-routes';
import { create } from 'zustand';
import { Profile } from '@/types/profile';

const useProfile = create((set) => ({
  // VALUES
  profile: {} as Profile,
  isLoading: false,
  error: null,

  // SETTERS
  setUserName: (newUserName: string) => set({ userName: newUserName }),

  // INITIALISER
  fetchProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`${API_ROUTES.PROFILE.getById}/${profileId}`);
      if (!res.ok) {
        set({
          isLoading: false,
          error: 'Unable to fetch profile'
        })
      };

      const data = await res.json() as Profile;
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}))

export default useProfile;
