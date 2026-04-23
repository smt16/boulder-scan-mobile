import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useGymStore from '@/stores/gym.store';
import { parseRouteIdFromScan } from '@/lib/parse-route-scan';

const SCAN_DEBOUNCE_MS = 2200;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const lastScanAt = useRef(0);
  const getRouteById = useGymStore((s) => s.getRouteById);
  const hydrate = useGymStore((s) => s.hydrate);
  const routesLen = useGymStore((s) => s.routes.length);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (!scanning) return;
      const now = Date.now();
      if (now - lastScanAt.current < SCAN_DEBOUNCE_MS) return;
      lastScanAt.current = now;

      const routeId = parseRouteIdFromScan(data);
      if (!routeId) {
        return;
      }
      if (routesLen === 0) {
        void hydrate().then(() => {
          const r = useGymStore.getState().getRouteById(routeId);
          if (r) {
            setScanning(false);
            router.push(`/route/${routeId}`);
          } else {
            Alert.alert('Unknown route', `No route matches “${routeId}”.`);
          }
        });
        return;
      }
      const r = getRouteById(routeId);
      if (r) {
        setScanning(false);
        router.push(`/route/${routeId}`);
      } else {
        Alert.alert('Unknown route', `No route matches “${routeId}”.`);
      }
    },
    [scanning, routesLen, getRouteById, hydrate, router]
  );

  if (!permission) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <ThemedText>Checking camera permission…</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top, paddingHorizontal: 24 }]}>
        <ThemedText type='subtitle' style={styles.centerText}>
          Camera access is needed to scan route QR codes at the gym.
        </ThemedText>
        <Pressable style={[styles.btn, { backgroundColor: tint }]} onPress={() => requestPermission()}>
          <ThemedText style={styles.btnText}>Allow camera</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <View style={[styles.banner, { paddingTop: insets.top + 8 }]}>
        <ThemedText type='defaultSemiBold'>Scan route QR</ThemedText>
        <ThemedText style={styles.hint}>
          Codes can be plain ids (e.g. r-1), JSON with routeId, or gym-extension://route/r-1
        </ThemedText>
        <Pressable onPress={() => setScanning((s) => !s)}>
          <ThemedText style={{ color: tint }}>{scanning ? 'Pause scanner' : 'Resume'}</ThemedText>
        </Pressable>
      </View>
      <CameraView
        style={styles.camera}
        facing='back'
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  centerText: {
    textAlign: 'center',
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  banner: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  hint: {
    opacity: 0.7,
    fontSize: 13,
  },
  camera: {
    flex: 1,
  },
});
