import { ApiError, postGoogleAuth } from '@/lib/http/api';
import useAuthStore from '@/stores/auth.store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

export function useGoogleSignIn() {
  const setSession = useAuthStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    if (Platform.OS === 'web') {
      setError('Google sign-in is not available on web.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success') {
        return;
      }
      const data = response.data;
      let idToken = data.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }
      if (!idToken) {
        throw new Error(
          'No ID token from Google. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
        );
      }
      const u = data.user;
      const displayName =
        [u.givenName, u.familyName].filter(Boolean).join(' ') ||
        u.name ||
        u.email ||
        'Climber';
      const { session } = await postGoogleAuth({
        idToken,
        email: u.email,
        displayName,
        googleUserId: u.id,
      });
      await setSession(session);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Google sign in failed';
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [setSession]);

  return { signIn, isLoading, error, setError };
}
