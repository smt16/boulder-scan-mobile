import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth0 } from '@/hooks/http/auth/useAuth0';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAuth0Configured } from '@/lib/auth0-config';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const text = Colors[colorScheme ?? 'light'].text;

  const {
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    isLoading,
    error,
    setError,
    isReady,
  } = useAuth0();
  const [configHint, setConfigHint] = useState<string | null>(null);

  const busy = isLoading;
  const canUseAuth0 = isAuth0Configured() && isReady;

  const onLogIn = async () => {
    setError(null);
    if (!isAuth0Configured()) {
      setConfigHint(
        'Add EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID to your env.',
      );
      return;
    }
    setConfigHint(null);
    try {
      await signIn();
    } catch {
      // error surfaced via hook state
    }
  };

  const onSignUp = async () => {
    setError(null);
    if (!isAuth0Configured()) {
      setConfigHint(
        'Add EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID to your env.',
      );
      return;
    }
    setConfigHint(null);
    try {
      await signUp();
    } catch {
      // error surfaced via hook state
    }
  };

  const onGoogleLogIn = async () => {
    setError(null);
    if (!isAuth0Configured()) {
      setConfigHint(
        'Add EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID to your env.',
      );
      return;
    }
    setConfigHint(null);
    try {
      await signInWithGoogle();
    } catch {
      // error surfaced via hook state
    }
  };

  const onGoogleSignUp = async () => {
    setError(null);
    if (!isAuth0Configured()) {
      setConfigHint(
        'Add EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID to your env.',
      );
      return;
    }
    setConfigHint(null);
    try {
      await signUpWithGoogle();
    } catch {
      // error surfaced via hook state
    }
  };

  return (
    <ThemedView style={styles.outer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ThemedText type='title' style={styles.title}>
          Boulder Scan
        </ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

        {configHint ? (
          <ThemedText style={styles.error}>{configHint}</ThemedText>
        ) : null}
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        {!canUseAuth0 && isAuth0Configured() ? (
          <ThemedText style={styles.hint}>Preparing sign-in…</ThemedText>
        ) : null}

        {busy ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={tint} />
            <ThemedText style={styles.hint}>Signing in with Auth0…</ThemedText>
          </View>
        ) : null}

        <Pressable
          style={[
            styles.primaryBtn,
            { backgroundColor: tint, opacity: busy || !canUseAuth0 ? 0.6 : 1 },
          ]}
          onPress={() => void onLogIn()}
          disabled={busy || !canUseAuth0}
        >
          <ThemedText type='defaultSemiBold' lightColor='#fff' darkColor='#fff'>
            Log in
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryBtn,
            {
              borderColor: `${text}44`,
              opacity: busy || !canUseAuth0 ? 0.6 : 1,
            },
          ]}
          onPress={() => void onSignUp()}
          disabled={busy || !canUseAuth0}
        >
          <ThemedText type='defaultSemiBold'>Create account</ThemedText>
        </Pressable>

        <View style={styles.dividerRow}>
          <View
            style={[styles.dividerLine, { backgroundColor: `${text}33` }]}
          />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View
            style={[styles.dividerLine, { backgroundColor: `${text}33` }]}
          />
        </View>

        <ThemedText type='defaultSemiBold' style={styles.googleHeading}>
          Google
        </ThemedText>

        <Pressable
          style={[
            styles.secondaryBtn,
            {
              borderColor: `${text}44`,
              opacity: busy || !canUseAuth0 ? 0.6 : 1,
            },
          ]}
          onPress={() => void onGoogleLogIn()}
          disabled={busy || !canUseAuth0}
        >
          <ThemedText type='defaultSemiBold'>Log in with Google</ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryBtn,
            {
              borderColor: `${text}44`,
              opacity: busy || !canUseAuth0 ? 0.6 : 1,
            },
          ]}
          onPress={() => void onGoogleSignUp()}
          disabled={busy || !canUseAuth0}
        >
          <ThemedText type='defaultSemiBold'>
            Create account with Google
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.demoHint}>
          Universal Login uses the Auth0 screen; Google options use the Auth0
          Google social connection (enable Google under Authentication → Social,
          connection name usually google-oauth2). Callback:{' '}
          {`gym-extension://callback`}. Same backend: Bearer token to{' '}
          {`EXPO_PUBLIC_API_BASE_URL`}/auth/login or /auth/signup.
        </ThemedText>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  keyboard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 14,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.75,
    marginBottom: 8,
  },
  error: {
    color: '#c00',
    opacity: 0.9,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  hint: {
    textAlign: 'center',
    opacity: 0.65,
    marginTop: 4,
  },
  loadingRow: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  dividerText: {
    opacity: 0.5,
    fontSize: 13,
  },
  googleHeading: {
    fontSize: 13,
    opacity: 0.7,
  },
  demoHint: {
    fontSize: 12,
    opacity: 0.55,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
