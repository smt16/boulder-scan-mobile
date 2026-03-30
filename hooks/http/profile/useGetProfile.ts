import { useEffect, useRef } from 'react';

import useProfile from '@/stores/profile.store';

/**
 * Loads profile into the global store when `profileId` is set.
 */
export function useGetProfile(profileId: string | null | undefined) {
  const fetchProfile = useProfile((s) => s.fetchProfile);
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      lastId.current = null;
      return;
    }
    if (lastId.current === profileId) return;
    lastId.current = profileId;
    void fetchProfile(profileId);
  }, [profileId, fetchProfile]);
}
