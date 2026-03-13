import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchRealms } from '../services/realms';
import { useFavorites } from '../hooks/useFavorites';
import { borderRadius, colors, spacing, typography } from '../theme';
import type { Realm } from '../types/realm';

const CACHE_KEY = '@realm_agent/realms_cache';
const REFRESH_INTERVAL_MS = 30_000;

type SortMode = 'name' | 'status' | 'favorites';

export default function RealmsScreen() {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('favorites');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchRealms();
      setRealms(data);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      if (realms.length === 0) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setRealms(JSON.parse(cached) as Realm[]);
        } else {
          setError('Could not load realm status. Is the backend running?');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [realms.length]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(false), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [load]);

  const filtered = useMemo(() => {
    let result = realms;

    if (showFavoritesOnly) {
      result = result.filter(r => isFavorite(r.id));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }

    return [...result].sort((a, b) => {
      if (sortMode === 'favorites') {
        const af = isFavorite(a.id) ? 0 : 1;
        const bf = isFavorite(b.id) ? 0 : 1;
        if (af !== bf) return af - bf;
        return a.name.localeCompare(b.name);
      }
      if (sortMode === 'status') {
        if (a.is_up !== b.is_up) return a.is_up ? -1 : 1;
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [realms, search, sortMode, showFavoritesOnly, isFavorite]);

  const onlineCount = realms.filter(r => r.is_up).length;
  const offlineCount = realms.length - onlineCount;

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        onRefresh={() => load()}
        refreshing={loading && realms.length > 0}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Realm Agent</Text>
              <Text style={styles.subtitle}>WoW Americas & Oceania</Text>
            </View>

            {!loading && realms.length > 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryItem}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.summaryText}>{onlineCount} online</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.dot, { backgroundColor: colors.error }]} />
                  <Text style={styles.summaryText}>{offlineCount} offline</Text>
                </View>
              </View>
            )}

            <TextInput
              style={styles.searchInput}
              placeholder="Search realms..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />

            <View style={styles.toolbar}>
              <View style={styles.sortRow}>
                {(['favorites', 'name', 'status'] as SortMode[]).map(mode => (
                  <Pressable
                    key={mode}
                    style={[styles.sortButton, sortMode === mode && styles.sortButtonActive]}
                    onPress={() => setSortMode(mode)}
                  >
                    <Text style={[styles.sortButtonText, sortMode === mode && styles.sortButtonTextActive]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[styles.favFilter, showFavoritesOnly && styles.favFilterActive]}
                onPress={() => setShowFavoritesOnly(v => !v)}
              >
                <Text style={styles.favFilterText}>
                  {showFavoritesOnly ? '★ Favorites' : '☆ Favorites'}
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={() => load()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {showFavoritesOnly ? 'No favorites yet.' : 'No realms found.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => toggleFavorite(item.id)}
          >
            <View style={[styles.statusDot, { backgroundColor: item.is_up ? colors.primary : colors.error }]} />
            <Text style={styles.realmName}>{item.name}</Text>
            <Text style={[styles.statusLabel, { color: item.is_up ? colors.primary : colors.error }]}>
              {item.is_up ? 'Online' : 'Offline'}
            </Text>
            <Text style={[styles.star, isFavorite(item.id) && styles.starActive]}>
              {isFavorite(item.id) ? '★' : '☆'}
            </Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.onBackground,
  },
  subtitle: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  summaryText: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
  },
  searchInput: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    color: colors.onBackground,
    ...typography.body1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  sortButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
  },
  sortButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  favFilter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
  },
  favFilterActive: {
    backgroundColor: colors.warning,
  },
  favFilterText: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  realmName: {
    ...typography.body1,
    color: colors.onSurface,
    flex: 1,
  },
  statusLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  star: {
    fontSize: 20,
    color: colors.onSurfaceVariant,
  },
  starActive: {
    color: colors.warning,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
  center: {
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.body2,
    color: colors.onBackground,
  },
});
