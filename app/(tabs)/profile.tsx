import { useCallback, useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ME_USER_ID } from '@/mocks/gym-data';
import useGymStore from '@/stores/gym.store';
import useProfile from '@/stores/profile.store';
import type { Ascent } from '@/types/climbing';

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <ThemedView style={styles.statBlock}>
      <ThemedText type="title">{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </ThemedView>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const profile = useProfile((s) => s.profile);
  const hydrate = useGymStore((s) => s.hydrate);
  const routes = useGymStore((s) => s.routes);
  const ascents = useGymStore((s) => s.ascents);
  const isLoading = useGymStore((s) => s.isLoading);
  const getUserStats = useGymStore((s) => s.getUserStats);

  useEffect(() => {
    if (routes.length === 0) void hydrate();
  }, [routes.length, hydrate]);

  const onRefresh = useCallback(() => {
    void hydrate();
  }, [hydrate]);

  const stats = getUserStats(ME_USER_ID);
  const myAscents = ascents
    .filter((a) => a.userId === ME_USER_ID)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  const displayName = profile.userName || 'Climber';

  const renderAscent = useCallback(
    ({ item }: { item: Ascent }) => {
      const route = routes.find((r) => r.id === item.routeId);
      return (
        <Pressable
          style={styles.ascentCard}
          onPress={() => router.push(`/route/${item.routeId}`)}>
          <ThemedText type="defaultSemiBold">{route?.name ?? item.routeId}</ThemedText>
          <ThemedText style={styles.muted}>
            {item.style} · {route?.grade ?? '?'}
          </ThemedText>
          <ThemedText style={styles.smallMuted}>
            {new Date(item.loggedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </ThemedText>
          {item.videoUrl ? (
            <Video
              style={styles.thumb}
              source={{ uri: item.videoUrl }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : null}
        </Pressable>
      );
    },
    [router, routes]
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <ThemedText type="title">{displayName}</ThemedText>
      {profile.email ? <ThemedText style={styles.muted}>{profile.email}</ThemedText> : null}

      <ThemedText type="subtitle" style={styles.section}>
        Your stats
      </ThemedText>
      <View style={styles.statsRow}>
        <StatBlock label="Total ascents" value={stats.totalAscents} />
        <StatBlock label="Unique routes" value={stats.uniqueRoutes} />
      </View>
      <View style={styles.statsRow}>
        <StatBlock label="Hardest send" value={stats.hardestGradeSent ?? '—'} />
        <StatBlock label="Last 30 days" value={stats.ascentsLast30Days} />
      </View>
      <View style={styles.statsRow}>
        <StatBlock label="With video" value={stats.withVideoCount} />
      </View>

      <View style={styles.sectionRow}>
        <ThemedText type="subtitle">My ascents</ThemedText>
        <Pressable onPress={() => router.push('/log-ascent')}>
          <ThemedText type="defaultSemiBold" style={{ color: tint }}>
            Log new
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={myAscents}
        keyExtractor={(a) => a.id}
        renderItem={renderAscent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={tint} />}
        ListEmptyComponent={<ThemedText style={styles.muted}>No ascents yet — log one from the Gym tab.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  muted: {
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBlock: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 32,
    gap: 12,
  },
  ascentCard: {
    padding: 14,
    borderRadius: 12,
    gap: 6,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  smallMuted: {
    opacity: 0.6,
    fontSize: 13,
  },
  thumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#000',
  },
});
