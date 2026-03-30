import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * Call once at startup (native only).
 *
 * Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the OAuth 2.0 **Web client** ID from
 * Google Cloud Console (same project as the iOS URL scheme in app.json). Required
 * for `idToken` on Android and for `getTokens()` when the sign-in payload omits it.
 */
export function configureGoogleSignIn(): void {
  if (Platform.OS === 'web') return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  GoogleSignin.configure({
    webClientId: webClientId || undefined,
  });
}
