import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';

import {
  requestPermission,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../services/fcm';
import { colors, spacing, typography } from '../theme';

const FCM_TOPICS = {
  statusChanges: 'wow_us_all_status',
  weeklyReset: 'wow_us_weekly_reset',
} as const;

interface NotificationSetting {
  id: string;
  label: string;
  topic: string;
  description: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'status',
    label: 'Status Changes',
    topic: FCM_TOPICS.statusChanges,
    description: 'Get notified when realms go offline or come back online',
  },
  {
    id: 'weekly_reset',
    label: 'Weekly Reset',
    topic: FCM_TOPICS.weeklyReset,
    description: 'US/Latin/Oceanic weekly reset — Tuesdays at 15:00 UTC',
  },
];

export default function HomeScreen() {
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({
    status: false,
    weekly_reset: false,
  });
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermission().then(setHasPermission);
  }, []);

  const handleToggle = useCallback(
    async (setting: NotificationSetting, enabled: boolean) => {
      if (enabled) {
        await subscribeToTopic(setting.topic);
      } else {
        await unsubscribeFromTopic(setting.topic);
      }
      setSubscriptions(prev => ({ ...prev, [setting.id]: enabled }));
    },
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={NOTIFICATION_SETTINGS}
        keyExtractor={item => item.id}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Realm Agent</Text>
              <Text style={styles.subtitle}>WoW Americas & Oceania</Text>
            </View>
            {!hasPermission && (
              <View style={styles.permissionBanner}>
                <Text style={styles.permissionText}>
                  Enable notifications to receive realm status alerts
                </Text>
              </View>
            )}
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
            <Switch
              value={subscriptions[item.id] ?? false}
              onValueChange={enabled => handleToggle(item, enabled)}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.onBackground}
            />
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
  permissionBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  permissionText: {
    ...typography.body2,
    color: colors.warning,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body1,
    color: colors.onSurface,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
});
