import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useGymStore from '@/stores/gym.store';
import type { FeedItem, GymRoute } from '@/types/climbing';

type HubTab = 'routes' | 'feed';

export default function GymHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const icon = Colors[colorScheme ?? 'light'].icon;

  const [tab, setTab] = useState<HubTab>('routes');
  const hydrate = useGymStore((s) => s.hydrate);
  const routes = useGymStore((s) => s.routes);
  const isLoading = useGymStore((s) => s.isLoading);
  const getFeed = useGymStore((s) => s.getFeed);

  useEffect(() => {
    if (routes.length === 0) void hydrate();
  }, [routes.length, hydrate]);

  const onRefresh = useCallback(() => {
    void hydrate();
  }, [hydrate]);

  const feed = getFeed();

  const renderRoute = useCallback(
    ({ item }: { item: GymRoute }) => (
      <Pressable
        style={[styles.routeCard, { borderColor: icon }]}
        onPress={() => router.push(`/route/${item.id}`)}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.muted}>
          {item.grade} · {item.sector}
        </ThemedText>
        <ThemedText style={styles.smallMuted}>Set {item.setDate}</ThemedText>
      </Pressable>
    ),
    [router, icon]
  );

  const renderFeed = useCallback(
    ({ item }: { item: FeedItem }) => (
      <Pressable
        style={[styles.feedCard, { borderColor: icon }]}
        onPress={() => router.push(`/route/${item.routeId}`)}>
        <View style={styles.feedHeader}>
          <ThemedText type="defaultSemiBold">{item.userName}</ThemedText>
          <ThemedText style={styles.muted}>{item.style}</ThemedText>
        </View>
        <ThemedText>
          {item.routeName} <ThemedText style={styles.muted}>({item.routeGrade})</ThemedText>
        </ThemedText>
        <ThemedText style={styles.smallMuted}>
          {new Date(item.loggedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </ThemedText>
        {item.note ? <ThemedText style={styles.note}>{item.note}</ThemedText> : null}
        {item.videoUrl ? (
          <Video
            style={styles.feedVideo}
            source={{ uri: item.videoUrl }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : null}
      </Pressable>
    ),
    [router, icon]
  );

  const keyRoute = useCallback((r: GymRoute) => r.id, []);
  const keyFeed = useCallback((f: FeedItem) => f.id, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <ThemedText type="title">Gym</ThemedText>
        <Pressable style={[styles.logBtn, { backgroundColor: tint }]} onPress={() => router.push('/log-ascent')}>
          <ThemedText style={styles.logBtnText}>Log ascent</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.segment, { borderColor: icon }]}>
        <Pressable
          style={[styles.segmentItem, tab === 'routes' && { backgroundColor: `${tint}28` }]}
          onPress={() => setTab('routes')}>
          <ThemedText type={tab === 'routes' ? 'defaultSemiBold' : 'default'}>Routes</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.segmentItem, tab === 'feed' && { backgroundColor: `${tint}28` }]}
          onPress={() => setTab('feed')}>
          <ThemedText type={tab === 'feed' ? 'defaultSemiBold' : 'default'}>Community</ThemedText>
        </Pressable>
      </View>

      {isLoading && routes.length === 0 ? (
        <ActivityIndicator size="large" color={tint} style={styles.loader} />
      ) : null}

      {tab === 'routes' ? (
        <FlatList
          data={routes}
          keyExtractor={keyRoute}
          renderItem={renderRoute}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading && routes.length > 0} onRefresh={onRefresh} tintColor={tint} />}
          ListEmptyComponent={
            !isLoading ? <ThemedText style={styles.muted}>No routes loaded.</ThemedText> : null
          }
        />
      ) : (
        <FlatList
          data={feed}
          keyExtractor={keyFeed}
          renderItem={renderFeed}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading && routes.length > 0} onRefresh={onRefresh} tintColor={tint} />}
          ListEmptyComponent={
            !isLoading ? <ThemedText style={styles.muted}>No activity yet.</ThemedText> : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  routeCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  feedCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muted: {
    opacity: 0.75,
  },
  smallMuted: {
    opacity: 0.6,
    fontSize: 13,
  },
  note: {
    fontStyle: 'italic',
    opacity: 0.9,
  },
  feedVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  loader: {
    marginTop: 24,
  },
});
