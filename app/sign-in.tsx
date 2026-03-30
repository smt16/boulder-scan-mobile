import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useEmailLogin } from '@/hooks/http/auth/useEmailLogin';
import { useGoogleSignIn } from '@/hooks/http/auth/useGoogleSignIn';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const bg = Colors[colorScheme ?? 'light'].background;
  const text = Colors[colorScheme ?? 'light'].text;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading: emailLoading, error: emailError, setError: setEmailError } = useEmailLogin();
  const {
    signIn: googleSignIn,
    isLoading: googleLoading,
    error: googleError,
    setError: setGoogleError,
  } = useGoogleSignIn();

  const busy = emailLoading || googleLoading;

  const onEmailSubmit = async () => {
    setEmailError(null);
    try {
      await login({ email, password });
    } catch {
      // error surfaced via hook state
    }
  };

  const onGooglePress = async () => {
    setGoogleError(null);
    try {
      await googleSignIn();
    } catch {
      // error surfaced via hook state
    }
  };

  return (
    <ThemedView style={styles.outer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ThemedText type="title" style={styles.title}>
          Boulder Scan
        </ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={`${text}99`}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!busy}
            style={[styles.input, { color: text, borderColor: `${text}33`, backgroundColor: bg }]}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={`${text}99`}
            secureTextEntry
            editable={!busy}
            style={[styles.input, { color: text, borderColor: `${text}33`, backgroundColor: bg }]}
          />
        </View>

        {emailError ? <ThemedText style={styles.error}>{emailError}</ThemedText> : null}
        {googleError ? <ThemedText style={styles.error}>{googleError}</ThemedText> : null}

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: tint, opacity: busy ? 0.6 : 1 }]}
          onPress={() => void onEmailSubmit()}
          disabled={busy}>
          {emailLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" lightColor="#fff" darkColor="#fff">
              Sign in with email
            </ThemedText>
          )}
        </Pressable>

        {Platform.OS !== 'web' ? (
          <Pressable
            style={[styles.secondaryBtn, { borderColor: `${text}44`, opacity: busy ? 0.6 : 1 }]}
            onPress={() => void onGooglePress()}
            disabled={busy}>
            {googleLoading ? (
              <ActivityIndicator color={tint} />
            ) : (
              <ThemedText type="defaultSemiBold">Continue with Google</ThemedText>
            )}
          </Pressable>
        ) : (
          <ThemedText style={styles.hint}>Google sign-in is available on iOS and Android.</ThemedText>
        )}

        <ThemedText style={styles.demoHint}>
          Demo: any email + non-empty password uses the mock Alex account. Google uses the mock Google
          demo user.
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
  field: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
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
  demoHint: {
    fontSize: 12,
    opacity: 0.55,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
