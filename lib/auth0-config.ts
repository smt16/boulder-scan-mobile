/**
 * Set in `.env` (or EAS env):
 * - EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
 * - EXPO_PUBLIC_AUTH0_CLIENT_ID=...
 * - EXPO_PUBLIC_AUTH0_AUDIENCE=... (API identifier, if you need the API’s JWT as access token)
 * - EXPO_PUBLIC_AUTH0_GOOGLE_CONNECTION=google-oauth2 (Auth0 social connection name; enable Google in Auth0 Dashboard → Authentication → Social)
 */
export function getAuth0Domain(): string | undefined {
  return process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
}

export function getAuth0ClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
}

export function getAuth0Audience(): string | undefined {
  return process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;
}

export function isAuth0Configured(): boolean {
  return Boolean(getAuth0Domain() && getAuth0ClientId());
}

/** Social connection for “Continue with Google” (Auth0 → Authentication → Social → Google). */
export function getAuth0GoogleConnection(): string {
  return process.env.EXPO_PUBLIC_AUTH0_GOOGLE_CONNECTION?.trim() || 'google-oauth2';
}
