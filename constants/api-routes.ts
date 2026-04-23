const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const base = raw ? raw.replace(/\/$/, '') : 'http://localhost:3333';

export const API_ROUTES = {
  AUTH: {
    login: `${base}/auth/login`,
    signup: `${base}/auth/signup`,
    google: `${base}/auth/google`,
  },
  PROFILE: {
    getById: (id: string) => `${base}/profile/${encodeURIComponent(id)}`,
  },
  ROUTES: {
    list: `${base}/routes`,
    getById: (id: string) => `${base}/routes/${encodeURIComponent(id)}`,
    stats: (id: string) => `${base}/routes/${encodeURIComponent(id)}/stats`,
  },
  ASCENTS: {
    list: `${base}/ascents`,
    create: `${base}/ascents`,
    mine: `${base}/users/me/ascents`,
  },
  FEED: {
    list: `${base}/feed`,
  },
  STATS: {
    me: `${base}/users/me/stats`,
  },
} as const;
