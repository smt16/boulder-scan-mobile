import {
  getAuth0Audience,
  getAuth0ClientId,
  getAuth0Domain,
  getAuth0GoogleConnection,
  isAuth0Configured,
} from '@/lib/auth0-config';
import { postAuthWithBearerToken } from '@/lib/http/auth0-backend';
import useAuthStore from '@/stores/auth.store';
import type { AuthSessionResult, DiscoveryDocument } from 'expo-auth-session';
import { exchangeCodeAsync, makeRedirectUri, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

/** When Auth0 domain is not set, skip OIDC discovery (no network). */
const idleDiscovery: DiscoveryDocument = {
  authorizationEndpoint: 'https://unconfigured/authorize',
  tokenEndpoint: 'https://unconfigured/token',
};

/**
 * Where Auth0 sends the user back with an **authorization code** (not to your API).
 * After `exchangeCodeAsync`, `postAuthWithBearerToken` sends the token to `EXPO_PUBLIC_API_BASE_URL`.
 *
 * **Auth0 dashboard:** the Application **must** be type **"Native"** (not SPA / Regular Web), or
 * `gym-extension://...` is rejected as an invalid callback URL. Add the **exact** string below
 * to Allowed Callback URLs and Allowed Logout URLs. In __DEV__ you can log `REDIRECT` to
 * copy the exact value Auth0 must allow (Expo Go uses `exp://...`, dev builds use `gym-extension://...`).
 */
const REDIRECT =
  Platform.OS === 'web' ? makeRedirectUri({ path: 'callback' }) : Linking.createURL('callback');

type Auth0Flow = 'login' | 'signup';
type Auth0Idp = 'universal' | 'google';

/**
 * Auth0 (browser) + backend POST with Bearer access token to `/auth/login` or `/auth/signup`.
 * `google` idp uses Auth0’s Google social connection (same backend calls).
 */
export function useAuth0() {
  const setSession = useAuthStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domain = getAuth0Domain();
  const clientId = getAuth0ClientId();
  const audience = getAuth0Audience();
  const discoveryInput = useMemo(
    () => (domain && domain.length > 0 ? `https://${domain}` : idleDiscovery),
    [domain],
  );
  const discovery = useAutoDiscovery(discoveryInput);

  const baseExtra = useMemo(() => {
    const p: Record<string, string> = {};
    if (audience) p.audience = audience;
    return p;
  }, [audience]);

  const googleConnection = getAuth0GoogleConnection();
  const googleLoginExtra = useMemo(
    () => ({ ...baseExtra, connection: googleConnection }),
    [baseExtra, googleConnection],
  );
  const googleSignupExtra = useMemo(
    () => ({ ...baseExtra, connection: googleConnection, screen_hint: 'signup' }),
    [baseExtra, googleConnection],
  );

  const [reqLogin, , promptLogin] = useAuthRequest(
    {
      clientId: clientId ?? ' ',
      redirectUri: REDIRECT,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
      extraParams: baseExtra,
    },
    discovery,
  );

  const signupExtra = useMemo(() => {
    return { ...baseExtra, screen_hint: 'signup' };
  }, [baseExtra]);

  const [reqSignup, , promptSignup] = useAuthRequest(
    {
      clientId: clientId ?? ' ',
      redirectUri: REDIRECT,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
      extraParams: signupExtra,
    },
    discovery,
  );

  const [reqGoogleLogin, , promptGoogleLogin] = useAuthRequest(
    {
      clientId: clientId ?? ' ',
      redirectUri: REDIRECT,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
      extraParams: googleLoginExtra,
    },
    discovery,
  );

  const [reqGoogleSignup, , promptGoogleSignup] = useAuthRequest(
    {
      clientId: clientId ?? ' ',
      redirectUri: REDIRECT,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
      extraParams: googleSignupExtra,
    },
    discovery,
  );

  const ready =
    isAuth0Configured() &&
    Boolean(discovery) &&
    Boolean(reqLogin) &&
    Boolean(reqSignup) &&
    Boolean(reqGoogleLogin) &&
    Boolean(reqGoogleSignup) &&
    Boolean(clientId);

  const runFlow = useCallback(
    async (flow: Auth0Flow, idp: Auth0Idp = 'universal') => {
      if (!isAuth0Configured() || !clientId) {
        setError('Set EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID');
        return;
      }
      if (!discovery) {
        setError('Auth0 discovery is not ready. Check EXPO_PUBLIC_AUTH0_DOMAIN and your network.');
        return;
      }
      let request;
      let prompt;
      if (idp === 'universal') {
        request = flow === 'login' ? reqLogin : reqSignup;
        prompt = flow === 'login' ? promptLogin : promptSignup;
      } else {
        request = flow === 'login' ? reqGoogleLogin : reqGoogleSignup;
        prompt = flow === 'login' ? promptGoogleLogin : promptGoogleSignup;
      }
      if (!request) {
        setError('Auth0 request is not ready.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result: AuthSessionResult = await prompt();
        if (result.type === 'dismiss' || result.type === 'cancel') {
          return;
        }
        if (result.type === 'error') {
          const p = 'params' in result ? result.params : undefined;
          const fromParams = p?.error_description ?? p?.error;
          const msg =
            result.error?.message ?? fromParams ?? result.errorCode ?? 'Auth0 authorization failed';
          setError(String(msg));
          return;
        }
        if (result.type !== 'success' || !('params' in result)) {
          setError('Sign in was not completed');
          return;
        }
        const code = result.params?.code;
        if (!code) {
          setError('No authorization code from Auth0');
          return;
        }
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri: REDIRECT,
            extraParams: { code_verifier: request.codeVerifier ?? '' },
          },
          discovery,
        );
        if (!tokenResponse.accessToken) {
          setError('No access token from Auth0');
          return;
        }
        const { session } = await postAuthWithBearerToken(
          flow === 'login' ? 'login' : 'signup',
          tokenResponse.accessToken,
        );
        await setSession(session);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Auth0 sign in failed';
        setError(message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [
      clientId,
      discovery,
      promptGoogleLogin,
      promptGoogleSignup,
      promptLogin,
      promptSignup,
      reqGoogleLogin,
      reqGoogleSignup,
      reqLogin,
      reqSignup,
      setSession,
    ],
  );

  const signIn = useCallback(() => runFlow('login', 'universal'), [runFlow]);
  const signUp = useCallback(() => runFlow('signup', 'universal'), [runFlow]);
  const signInWithGoogle = useCallback(() => runFlow('login', 'google'), [runFlow]);
  const signUpWithGoogle = useCallback(() => runFlow('signup', 'google'), [runFlow]);

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    isLoading,
    error,
    setError,
    isReady: ready,
  };
}
