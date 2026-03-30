import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import type { CameraRecordingOptions } from 'expo-camera';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useAuthStore from '@/stores/auth.store';
import useGymStore from '@/stores/gym.store';
import type { AscentStyle } from '@/types/climbing';

const STYLES_LIST: AscentStyle[] = ['flash', 'redpoint', 'onsight', 'attempt'];

export default function LogAscentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routeId?: string }>();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const bg = Colors[colorScheme ?? 'light'].background;
  const text = Colors[colorScheme ?? 'light'].text;

  const session = useAuthStore((s) => s.session);
  const hydrate = useGymStore((s) => s.hydrate);
  const routes = useGymStore((s) => s.routes);
  const addAscent = useGymStore((s) => s.addAscent);
  const getRouteById = useGymStore((s) => s.getRouteById);

  const [routeId, setRouteId] = useState(params.routeId ?? '');
  const [style, setStyle] = useState<AscentStyle>('redpoint');
  const [note, setNote] = useState('');
  const [videoUri, setVideoUri] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const cameraRef = useRef<InstanceType<typeof CameraView> | null>(null);
  const [recording, setRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (routes.length === 0) void hydrate();
  }, [routes.length, hydrate]);

  useEffect(() => {
    if (params.routeId) setRouteId(params.routeId);
  }, [params.routeId]);

  const pickVideo = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 120,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setVideoUri(result.assets[0].uri);
    }
  }, []);

  const startRecord = useCallback(async () => {
    if (!camPerm?.granted) {
      await requestCamPerm();
      return;
    }
    if (!micPerm?.granted) {
      await requestMicPerm();
      return;
    }
    setShowCamera(true);
  }, [camPerm?.granted, micPerm?.granted, requestCamPerm, requestMicPerm]);

  const toggleRecord = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    if (!recording) {
      setRecording(true);
      const opts: CameraRecordingOptions = { maxDuration: 60 };
      void cam
        .recordAsync(opts)
        .then((vid: { uri: string } | undefined) => {
          if (vid?.uri) setVideoUri(vid.uri);
        })
        .catch(() => {})
        .finally(() => {
          setRecording(false);
          setShowCamera(false);
        });
    } else {
      cam.stopRecording();
    }
  }, [recording]);

  const onSubmit = useCallback(async () => {
    if (!routeId || !getRouteById(routeId) || !session) return;
    setSubmitting(true);
    try {
      // TODO: upload local file:// video via presigned URL, then pass remote URL to API.
      addAscent({
        routeId,
        userId: session.userId,
        userName: session.displayName,
        style,
        note: note.trim() || undefined,
        videoUrl: videoUri,
      });
      router.back();
    } finally {
      setSubmitting(false);
    }
  }, [routeId, style, note, videoUri, addAscent, router, getRouteById, session]);

  const selectedRoute = routeId ? getRouteById(routeId) : undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={onSubmit}
              disabled={submitting || !selectedRoute}
              style={{ paddingHorizontal: 12, opacity: submitting || !selectedRoute ? 0.4 : 1 }}>
              <ThemedText type="defaultSemiBold" style={{ color: tint }}>
                Save
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle">Route</ThemedText>
        <View style={styles.routePick}>
          {routes.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => setRouteId(r.id)}
              style={[
                styles.routeChip,
                { borderColor: routeId === r.id ? tint : Colors[colorScheme ?? 'light'].icon },
                routeId === r.id && { backgroundColor: `${tint}22` },
              ]}>
              <ThemedText type={routeId === r.id ? 'defaultSemiBold' : 'default'}>
                {r.name} ({r.grade})
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {!selectedRoute && routeId ? (
          <ThemedText style={styles.warn}>Unknown route id — pick one above.</ThemedText>
        ) : null}

        <ThemedText type="subtitle" style={styles.gapTop}>
          Style
        </ThemedText>
        <View style={styles.styleRow}>
          {STYLES_LIST.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStyle(s)}
              style={[
                styles.styleChip,
                { borderColor: style === s ? tint : Colors[colorScheme ?? 'light'].icon },
                style === s && { backgroundColor: `${tint}22` },
              ]}>
              <ThemedText type={style === s ? 'defaultSemiBold' : 'default'}>{s}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="subtitle" style={styles.gapTop}>
          Note (optional)
        </ThemedText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="How did it feel?"
          placeholderTextColor={`${text}88`}
          multiline
          style={[
            styles.input,
            { color: text, borderColor: Colors[colorScheme ?? 'light'].icon, backgroundColor: bg },
          ]}
        />

        <ThemedText type="subtitle" style={styles.gapTop}>
          Video (optional)
        </ThemedText>
        <View style={styles.row}>
          <Pressable style={[styles.secondaryBtn, { borderColor: tint }]} onPress={pickVideo}>
            <ThemedText type="defaultSemiBold">Choose from library</ThemedText>
          </Pressable>
          <Pressable style={[styles.secondaryBtn, { borderColor: tint }]} onPress={startRecord}>
            <ThemedText type="defaultSemiBold">Record</ThemedText>
          </Pressable>
        </View>

        {showCamera && camPerm?.granted ? (
          <ThemedView style={styles.cameraBox}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="video" mute={false} />
            <Pressable
              style={[styles.recordBtn, { backgroundColor: recording ? '#c00' : tint }]}
              onPress={toggleRecord}>
              <ThemedText style={styles.recordBtnText}>{recording ? 'Stop' : 'Record'}</ThemedText>
            </Pressable>
          </ThemedView>
        ) : null}

        {videoUri ? (
          <ThemedView style={styles.previewBox}>
            <ThemedText style={styles.muted}>Preview</ThemedText>
            <Video
              style={styles.previewVideo}
              source={{ uri: videoUri }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
            <Pressable onPress={() => setVideoUri(undefined)}>
              <ThemedText type="defaultSemiBold" style={{ color: '#c00' }}>
                Remove video
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : null}

        {submitting ? <ActivityIndicator color={tint} style={{ marginTop: 16 }} /> : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  routePick: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  routeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  styleChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  gapTop: {
    marginTop: 20,
  },
  input: {
    marginTop: 8,
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  cameraBox: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 8,
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#000',
  },
  recordBtn: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  recordBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewBox: {
    marginTop: 16,
    gap: 8,
  },
  previewVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  muted: {
    opacity: 0.7,
    fontSize: 13,
  },
  warn: {
    color: '#c00',
    marginTop: 8,
    fontSize: 13,
  },
});
