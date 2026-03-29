import type { Ascent, GymRoute } from '@/types/climbing';

export const MOCK_GYM_ID = 'gym-demo';

/** Current member (replace with auth / profile id when BE exists). */
export const ME_USER_ID = 'user-alex';
export const ME_USER_NAME = 'Alex';

export const MOCK_ROUTES: GymRoute[] = [
  {
    id: 'r-1',
    name: 'Sloper Convention',
    grade: 'V4',
    sector: 'Cave',
    setDate: '2026-03-01',
    gymId: MOCK_GYM_ID,
  },
  {
    id: 'r-2',
    name: 'Pinch Marathon',
    grade: 'V6',
    sector: 'Slab',
    setDate: '2026-03-10',
    gymId: MOCK_GYM_ID,
  },
  {
    id: 'r-3',
    name: 'Dyno to Jug',
    grade: 'V3',
    sector: 'Overhang',
    setDate: '2026-03-15',
    retireDate: undefined,
    gymId: MOCK_GYM_ID,
  },
  {
    id: 'r-4',
    name: 'Crimp Ladder',
    grade: 'V7',
    sector: 'Cave',
    setDate: '2026-02-20',
    gymId: MOCK_GYM_ID,
  },
];

export const MOCK_ASCENTS: Ascent[] = [
  {
    id: 'a-1',
    routeId: 'r-1',
    userId: 'user-sam',
    userName: 'Sam',
    style: 'flash',
    loggedAt: '2026-03-26T14:00:00.000Z',
    note: 'So good!',
  },
  {
    id: 'a-2',
    routeId: 'r-2',
    userId: 'user-jordan',
    userName: 'Jordan',
    style: 'redpoint',
    loggedAt: '2026-03-26T16:30:00.000Z',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'a-3',
    routeId: 'r-1',
    userId: ME_USER_ID,
    userName: ME_USER_NAME,
    style: 'redpoint',
    loggedAt: '2026-03-25T10:00:00.000Z',
  },
  {
    id: 'a-4',
    routeId: 'r-3',
    userId: 'user-sam',
    userName: 'Sam',
    style: 'onsight',
    loggedAt: '2026-03-24T18:00:00.000Z',
  },
  {
    id: 'a-5',
    routeId: 'r-4',
    userId: 'user-jordan',
    userName: 'Jordan',
    style: 'attempt',
    loggedAt: '2026-03-23T12:00:00.000Z',
  },
];
