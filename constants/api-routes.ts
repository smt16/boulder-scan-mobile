const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export const API_ROUTES = {
  AUTH: {
    login: `${base}/auth/login`,
    google: `${base}/auth/google`,
  },
  PROFILE: {
    getById: (id: string) => `${base}/profile/${id}`,
  },
  ROUTES: {
    list: `${base}/routes`,
    getById: (id: string) => `${base}/routes/${id}`,
    stats: (id: string) => `${base}/routes/${id}/stats`,
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
