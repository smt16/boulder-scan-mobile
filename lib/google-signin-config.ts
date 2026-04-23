import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * Call once at startup (native only).
 *
 * - **iOS** needs the **iOS OAuth client** id (`...apps.googleusercontent.com`) via
 *   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` unless `GoogleService-Info.plist` is embedded in
 *   the native target (Expo: after prebuild, add it under `ios/…` and include in the target).
 * - **Android** uses `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (Web client) for `idToken` / `getTokens()`.
 */
export function configureGoogleSignIn(): void {
  if (Platform.OS === 'web') return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  GoogleSignin.configure({
    webClientId: Platform.OS === 'android'? webClientId || undefined : undefined,
    iosClientId: Platform.OS === 'ios' ? iosClientId || undefined : undefined,
  });
}
