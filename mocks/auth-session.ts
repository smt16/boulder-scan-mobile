import type { Profile } from '@/types/profile';
import { ClimberLevel } from '@/types/profile';
import { ME_USER_ID, ME_USER_NAME } from '@/mocks/gym-data';

export type AuthProvider = 'email' | 'google';

/** Persisted app session after login. */
export interface Session {
  userId: string;
  email: string;
  displayName: string;
  provider: AuthProvider;
  accessToken?: string;
}

export interface LoginResponse {
  session: Session;
}

export interface GoogleAuthRequestBody {
  idToken: string;
  email?: string;
  displayName?: string;
  googleUserId?: string;
}

/** Demo user aligned with MOCK_ASCENTS entries for user-alex. */
export const MOCK_EMAIL_SESSION: Session = {
  userId: ME_USER_ID,
  email: 'alex@example.com',
  displayName: ME_USER_NAME,
  provider: 'email',
  accessToken: 'mock-access-token-email',
};

/** Second mock user for Google sign-in (different ascents in feed). */
export const MOCK_GOOGLE_SESSION: Session = {
  userId: 'user-google-demo',
  email: 'google.demo@gmail.com',
  displayName: 'Google Demo',
  provider: 'google',
  accessToken: 'mock-access-token-google',
};

const MOCK_PROFILES: Record<string, Profile> = {
  [ME_USER_ID]: {
    userName: ME_USER_NAME,
    email: MOCK_EMAIL_SESSION.email,
    gymId: 'gym-demo',
    gymName: 'Demo Boulder Gym',
    gymRank: 12,
    level: ClimberLevel.inter,
    projects: ['r-4', 'r-2'],
  },
  [MOCK_GOOGLE_SESSION.userId]: {
    userName: MOCK_GOOGLE_SESSION.displayName,
    email: MOCK_GOOGLE_SESSION.email,
    gymId: 'gym-demo',
    gymName: 'Demo Boulder Gym',
    gymRank: 42,
    level: ClimberLevel.beg,
    projects: ['r-1'],
  },
};

export function getMockProfile(userId: string): Profile | null {
  return MOCK_PROFILES[userId] ? { ...MOCK_PROFILES[userId] } : null;
}
