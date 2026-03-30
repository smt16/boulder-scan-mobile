import { create } from 'zustand';
import type { Ascent, AscentStyle, FeedItem, GymRoute, RouteStats, UserClimbingStats } from '@/types/climbing';
import { getAscents, getRoutes, MockHttpError } from '@/lib/http/mock-client';

const emptyStyleCounts = (): Record<AscentStyle, number> => ({
  flash: 0,
  redpoint: 0,
  onsight: 0,
  attempt: 0,
});

function gradeRank(grade: string): number {
  const m = /^V(\d+)$/.exec(grade.trim());
  return m ? parseInt(m[1], 10) : 0;
}

function buildFeed(ascents: Ascent[], routes: GymRoute[]): FeedItem[] {
  const routeMap = new Map(routes.map((r) => [r.id, r]));
  return [...ascents]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .map((a) => {
      const r = routeMap.get(a.routeId);
      return {
        ...a,
        routeName: r?.name ?? 'Unknown route',
        routeGrade: r?.grade ?? '?',
      };
    });
}

function buildRouteStats(routeId: string, ascents: Ascent[]): RouteStats {
  const forRoute = ascents.filter((a) => a.routeId === routeId);
  const climbers = new Set(forRoute.map((a) => a.userId));
  const byStyle = emptyStyleCounts();
  for (const a of forRoute) {
    byStyle[a.style] += 1;
  }
  const last = forRoute
    .map((a) => a.loggedAt)
    .sort((x, y) => new Date(y).getTime() - new Date(x).getTime())[0];
  return {
    routeId,
    totalAscents: forRoute.length,
    uniqueClimbers: climbers.size,
    byStyle,
    lastAscentAt: last ?? null,
  };
}

function buildUserStats(userId: string, ascents: Ascent[], routes: GymRoute[]): UserClimbingStats {
  const mine = ascents.filter((a) => a.userId === userId);
  const routeIds = new Set(mine.map((a) => a.routeId));
  const sent = mine.filter((a) => a.style !== 'attempt');
  const routeMap = new Map(routes.map((r) => [r.id, r]));
  let hardest: string | undefined;
  let bestRank = 0;
  for (const a of sent) {
    const g = routeMap.get(a.routeId)?.grade;
    if (g) {
      const r = gradeRank(g);
      if (r > bestRank) {
        bestRank = r;
        hardest = g;
      }
    }
  }
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const ascentsLast30Days = mine.filter((a) => new Date(a.loggedAt).getTime() >= cutoff).length;
  return {
    userId,
    totalAscents: mine.length,
    uniqueRoutes: routeIds.size,
    hardestGradeSent: hardest,
    ascentsLast30Days,
    withVideoCount: mine.filter((a) => !!a.videoUrl).length,
  };
}

interface GymState {
  routes: GymRoute[];
  ascents: Ascent[];
  isLoading: boolean;
  error: string | null;

  /** Loads routes and ascents via mock HTTP client (no real network). */
  hydrate: () => Promise<void>;

  getRouteById: (id: string) => GymRoute | undefined;
  getRouteStats: (routeId: string) => RouteStats;
  getFeed: () => FeedItem[];
  getUserStats: (userId: string) => UserClimbingStats;
  getRecentAscentsForRoute: (routeId: string, limit?: number) => Ascent[];

  addAscent: (input: {
    routeId: string;
    userId: string;
    userName: string;
    style: AscentStyle;
    note?: string;
    videoUrl?: string;
  }) => void;
}

const useGymStore = create<GymState>((set, get) => ({
  routes: [],
  ascents: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const [routes, ascents] = await Promise.all([getRoutes(), getAscents()]);
      set({
        routes: [...routes],
        ascents: [...ascents],
        isLoading: false,
      });
    } catch (e: unknown) {
      const message =
        e instanceof MockHttpError ? e.message : e instanceof Error ? e.message : 'Failed to load gym data';
      set({ error: message, isLoading: false });
    }
  },

  getRouteById: (id) => get().routes.find((r) => r.id === id),

  getRouteStats: (routeId) => buildRouteStats(routeId, get().ascents),

  getFeed: () => buildFeed(get().ascents, get().routes),

  getUserStats: (userId) => buildUserStats(userId, get().ascents, get().routes),

  getRecentAscentsForRoute: (routeId, limit = 20) =>
    [...get().ascents]
      .filter((a) => a.routeId === routeId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
      .slice(0, limit),

  addAscent: (input) => {
    const id = `a-${Date.now()}`;
    const loggedAt = new Date().toISOString();
    const next: Ascent = {
      id,
      routeId: input.routeId,
      userId: input.userId,
      userName: input.userName,
      style: input.style,
      loggedAt,
      note: input.note,
      videoUrl: input.videoUrl,
    };
    set((s) => ({ ascents: [next, ...s.ascents] }));
    // TODO: POST API_ROUTES.ASCENTS.create; if videoUrl is local file://, request presigned upload first.
  },
}));

export default useGymStore;
