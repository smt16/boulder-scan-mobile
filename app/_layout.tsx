import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { type Href, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { configureGoogleSignIn } from '@/lib/google-signin-config';
import useAuthStore from '@/stores/auth.store';
import * as WebBrowser from 'expo-web-browser';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthRoot() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const isStorageHydrated = useAuthStore((s) => s.isStorageHydrated);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    void hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isStorageHydrated) return;

    const root = (segments as string[])[0];
    const onSignIn = root === 'sign-in';

    if (!session && !onSignIn) {
      router.replace('/sign-in' as Href);
    } else if (session && onSignIn) {
      router.replace('/(tabs)/scan');
    }
  }, [session, segments, isStorageHydrated, router]);

  if (!isStorageHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='sign-in' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='route/[id]'
          options={{
            title: 'Route',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name='log-ascent'
          options={{
            presentation: 'modal',
            title: 'Log ascent',
          }}
        />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <AuthRoot />;
}
