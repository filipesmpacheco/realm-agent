import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchRealms } from '../services/realms';
import { borderRadius, colors, spacing, typography } from '../theme';
import type { Realm } from '../types/realm';

export default function RealmsScreen() {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRealms();
      setRealms(data);
    } catch (e) {
      setError('Could not load realm status. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onlineCount = realms.filter(r => r.is_up).length;
  const offlineCount = realms.length - onlineCount;

  return (
    <View style={styles.container}>
      <FlatList
        data={realms}
        keyExtractor={item => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        onRefresh={load}
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
            <Text style={styles.sectionTitle}>Realms</Text>
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
              <Pressable style={styles.retryButton} onPress={load}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No realms found.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.statusDot, { backgroundColor: item.is_up ? colors.primary : colors.error }]} />
            <Text style={styles.realmName}>{item.name}</Text>
            <Text style={[styles.statusLabel, { color: item.is_up ? colors.primary : colors.error }]}>
              {item.is_up ? 'Online' : 'Offline'}
            </Text>
          </View>
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
    paddingBottom: spacing.md,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
