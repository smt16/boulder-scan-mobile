import { API_ROUTES } from '@/constants/api-routes';
import useAuthStore from '@/stores/auth.store';
import type { EmailLoginBody, GoogleAuthRequestBody, LoginResponse } from '@/types/auth';
import type { Ascent, AscentStyle, GymRoute } from '@/types/climbing';
import type { Profile } from '@/types/profile';

export type { EmailLoginBody };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAccessToken(): string | undefined {
  return useAuthStore.getState().session?.accessToken;
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  let message = text || `Request failed (${res.status})`;
  if (!text) return message;
  try {
    const j = JSON.parse(text) as { message?: string; error?: string };
    if (j.message) return j.message;
    if (j.error) return j.error;
  } catch {
    // use raw
  }
  return message;
}

type ApiFetchOptions = RequestInit & { skipAppAuth?: boolean };

async function apiFetch(url: string, init: ApiFetchOptions = {}): Promise<Response> {
  const { skipAppAuth, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (rest.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!skipAppAuth) {
    const t = getAccessToken();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  return fetch(url, { ...rest, headers });
}

async function expectJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await readErrorMessage(res);
    throw new ApiError(msg, res.status);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getJson<T>(url: string): Promise<T> {
  const res = await apiFetch(url, { method: 'GET' });
  return expectJson<T>(res);
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

export async function postEmailLogin(body: EmailLoginBody): Promise<LoginResponse> {
  const res = await apiFetch(API_ROUTES.AUTH.login, {
    method: 'POST',
    body: JSON.stringify(body),
    skipAppAuth: true,
  });
  return expectJson<LoginResponse>(res);
}

export async function postGoogleAuth(body: GoogleAuthRequestBody): Promise<LoginResponse> {
  const res = await apiFetch(API_ROUTES.AUTH.google, {
    method: 'POST',
    body: JSON.stringify(body),
    skipAppAuth: true,
  });
  return expectJson<LoginResponse>(res);
}

export async function postCreateAscent(input: {
  routeId: string;
  userId: string;
  userName: string;
  style: AscentStyle;
  note?: string;
  videoUrl?: string;
}): Promise<Ascent> {
  const res = await apiFetch(API_ROUTES.ASCENTS.create, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return expectJson<Ascent>(res);
}
