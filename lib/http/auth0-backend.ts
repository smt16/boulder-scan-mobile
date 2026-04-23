import { API_ROUTES } from '@/constants/api-routes';
import type { LoginResponse } from '@/types/auth';

export async function postAuthWithBearerToken(
  path: 'login' | 'signup',
  accessToken: string,
): Promise<LoginResponse> {
  const url = path === 'login' ? API_ROUTES.AUTH.login : API_ROUTES.AUTH.signup;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || `Request failed (${res.status})`;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      if (j.message) message = j.message;
      else if (j.error) message = j.error;
    } catch {
      // use raw text
    }
    throw new Error(message);
  }
  const data = (await res.json()) as LoginResponse;
  if (data.session && !data.session.provider) {
    return {
      ...data,
      session: { ...data.session, provider: 'auth0' },
    };
  }
  return data;
}
