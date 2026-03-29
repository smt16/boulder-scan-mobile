export type AscentStyle = 'flash' | 'redpoint' | 'onsight' | 'attempt';

/** A climbable line in the gym (named GymRoute to avoid clashing with Expo Router). */
export interface GymRoute {
  id: string;
  name: string;
  grade: string;
  sector: string;
  setDate: string;
  retireDate?: string;
  gymId: string;
}

export interface Ascent {
  id: string;
  routeId: string;
  userId: string;
  userName: string;
  style: AscentStyle;
  loggedAt: string;
  note?: string;
  /** Remote URL after upload, or local file URI during MVP. */
  videoUrl?: string;
}

/** Feed row: ascent plus denormalized route labels for lists. */
export interface FeedItem extends Ascent {
  routeName: string;
  routeGrade: string;
}

export interface RouteStats {
  routeId: string;
  totalAscents: number;
  uniqueClimbers: number;
  byStyle: Record<AscentStyle, number>;
  lastAscentAt: string | null;
}

export interface UserClimbingStats {
  userId: string;
  totalAscents: number;
  uniqueRoutes: number;
  hardestGradeSent?: string;
  ascentsLast30Days: number;
  withVideoCount: number;
}
