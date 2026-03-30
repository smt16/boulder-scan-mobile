import { API_ROUTES } from '@/constants/api-routes';
import {
  getMockProfile,
  MOCK_EMAIL_SESSION,
  MOCK_GOOGLE_SESSION,
  type GoogleAuthRequestBody,
  type LoginResponse,
  type Session,
} from '@/mocks/auth-session';
import { MOCK_ASCENTS, MOCK_ROUTES } from '@/mocks/gym-data';
import type { Ascent, GymRoute } from '@/types/climbing';
import type { Profile } from '@/types/profile';

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizePath(url: string): string {
  try {
    const u = url.startsWith('http') ? new URL(url) : new URL(url, 'https://mock.local');
    return u.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url.split('?')[0]?.replace(/\/$/, '') ?? url;
  }
}

function pathProfileId(path: string): string | null {
  const m = /^\/profile\/([^/]+)$/.exec(path);
  return m ? decodeURIComponent(m[1]) : null;
}

export class MockHttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'MockHttpError';
  }
}

export async function getJson<T>(url: string): Promise<T> {
  await delay(MOCK_LATENCY_MS);
  const path = normalizePath(url);

  if (path === normalizePath(API_ROUTES.ROUTES.list)) {
    return structuredClone(MOCK_ROUTES) as T;
  }

  if (path === normalizePath(API_ROUTES.ASCENTS.list)) {
    return structuredClone(MOCK_ASCENTS) as T;
  }

  const profileId = pathProfileId(path);
  if (profileId) {
    const profile = getMockProfile(profileId);
    if (!profile) {
      throw new MockHttpError('Profile not found', 404);
    }
    return profile as T;
  }

  throw new MockHttpError(`Mock GET not implemented: ${path}`, 404);
}

export async function getRoutes(): Promise<GymRoute[]> {
  return getJson<GymRoute[]>(API_ROUTES.ROUTES.list);
}

export async function getAscents(): Promise<Ascent[]> {
  return getJson<Ascent[]>(API_ROUTES.ASCENTS.list);
}

export async function getProfileById(id: string): Promise<Profile> {
  return getJson<Profile>(API_ROUTES.PROFILE.getById(id));
}

export interface EmailLoginBody {
  email: string;
  password: string;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  await delay(MOCK_LATENCY_MS);
  const path = normalizePath(url);

  if (path === normalizePath(API_ROUTES.AUTH.login)) {
    const { email, password } = body as EmailLoginBody;
    if (!email?.trim() || !password) {
      throw new MockHttpError('Email and password are required', 400);
    }
    const session: Session = {
      ...MOCK_EMAIL_SESSION,
      email: email.trim(),
    };
    return { session } as T;
  }

  if (path === normalizePath(API_ROUTES.AUTH.google)) {
    const b = body as GoogleAuthRequestBody;
    const session: Session = {
      ...MOCK_GOOGLE_SESSION,
      email: b.email ?? MOCK_GOOGLE_SESSION.email,
      displayName: b.displayName ?? MOCK_GOOGLE_SESSION.displayName,
      userId: b.googleUserId ?? MOCK_GOOGLE_SESSION.userId,
    };
    return { session } as T;
  }

  throw new MockHttpError(`Mock POST not implemented: ${path}`, 404);
}

export async function postEmailLogin(body: EmailLoginBody): Promise<LoginResponse> {
  return postJson<LoginResponse>(API_ROUTES.AUTH.login, body);
}

export async function postGoogleAuth(body: GoogleAuthRequestBody): Promise<LoginResponse> {
  return postJson<LoginResponse>(API_ROUTES.AUTH.google, body);
}
