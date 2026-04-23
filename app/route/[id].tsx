import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useGymStore from '@/stores/gym.store';
import type { AscentStyle } from '@/types/climbing';

function StatChip({ label, value }: { label: string; value: string | number }) {
  const colorScheme = useColorScheme();
  const border = Colors[colorScheme ?? 'light'].icon;
  return (
    <ThemedView style={[styles.chip, { borderColor: border }]}>
      <ThemedText type='defaultSemiBold'>{value}</ThemedText>
      <ThemedText style={styles.chipLabel}>{label}</ThemedText>
    </ThemedView>
  );
}

function AscentRow({ ascent }: { ascent: { userName: string; style: AscentStyle; loggedAt: string } }) {
  return (
    <ThemedView style={styles.ascentRow}>
      <ThemedText type='defaultSemiBold'>{ascent.userName}</ThemedText>
      <ThemedText>{ascent.style}</ThemedText>
      <ThemedText style={styles.muted}>
        {new Date(ascent.loggedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </ThemedText>
    </ThemedView>
  );
}

function FeedVideo({ uri }: { uri: string }) {
  return (
    <Video
      style={styles.video}
      source={{ uri }}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      isLooping={false}
    />
  );
}

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const hydrate = useGymStore((s) => s.hydrate);
  const getRouteById = useGymStore((s) => s.getRouteById);
  const getRouteStats = useGymStore((s) => s.getRouteStats);
  const getRecentAscentsForRoute = useGymStore((s) => s.getRecentAscentsForRoute);
  const routes = useGymStore((s) => s.routes);
  const isLoading = useGymStore((s) => s.isLoading);

  useEffect(() => {
    if (routes.length === 0) void hydrate();
  }, [routes.length, hydrate]);

  const route = id ? getRouteById(id) : undefined;
  const stats = id ? getRouteStats(id) : null;
  const recent = useMemo(() => (id ? getRecentAscentsForRoute(id, 15) : []), [id, getRecentAscentsForRoute]);

  const openLog = useCallback(() => {
    if (!id) return;
    router.push({ pathname: '/log-ascent', params: { routeId: id } });
  }, [id, router]);

  if (isLoading && !route) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size='large' color={tint} />
      </ThemedView>
    );
  }

  if (!route || !stats) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type='title'>Route not found</ThemedText>
        <ThemedText style={styles.muted}>Check the QR code or pick a route from the Gym tab.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>{route.name}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {route.grade} · {route.sector}
        </ThemedText>
        <ThemedText style={styles.muted}>Set {route.setDate}</ThemedText>
      </ThemedView>

      <ThemedText type='subtitle' style={styles.sectionTitle}>
        Gym stats
      </ThemedText>
      <View style={styles.chipRow}>
        <StatChip label='Total ascents' value={stats.totalAscents} />
        <StatChip label='Unique climbers' value={stats.uniqueClimbers} />
      </View>
      <View style={styles.chipRow}>
        <StatChip label='Flash' value={stats.byStyle.flash} />
        <StatChip label='Redpoint' value={stats.byStyle.redpoint} />
        <StatChip label='Onsight' value={stats.byStyle.onsight} />
        <StatChip label='Attempts' value={stats.byStyle.attempt} />
      </View>
      {stats.lastAscentAt ? (
        <ThemedText style={styles.muted}>
          Last activity: {new Date(stats.lastAscentAt).toLocaleString()}
        </ThemedText>
      ) : null}

      <Pressable style={[styles.primaryBtn, { backgroundColor: tint }]} onPress={openLog}>
        <ThemedText style={styles.primaryBtnText}>Log ascent</ThemedText>
      </Pressable>

      <ThemedText type='subtitle' style={styles.sectionTitle}>
        Recent activity
      </ThemedText>
      {recent.map((a) => (
        <View key={a.id}>
          <AscentRow ascent={a} />
          {a.videoUrl ? (
            <ThemedView style={styles.videoWrap}>
              <FeedVideo uri={a.videoUrl} />
            </ThemedView>
          ) : null}
        </View>
      ))}
      {recent.length === 0 ? <ThemedText style={styles.muted}>No ascents yet.</ThemedText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    opacity: 0.9,
  },
  muted: {
    opacity: 0.65,
    fontSize: 14,
  },
  sectionTitle: {
    marginTop: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  chipLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  ascentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  videoWrap: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
});
