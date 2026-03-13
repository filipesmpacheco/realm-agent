import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { logout, updateDisplayName } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { borderRadius, colors, spacing, typography } from '../theme';

export default function ProfileScreen() {
  const authState = useAuth();
  const user = authState.status === 'authenticated' ? authState.user : null;

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDisplayName(displayName.trim());
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Could not sign out. Please try again.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const sections = [
    { key: 'nickname' },
    { key: 'signout' },
  ];

  return (
    <FlatList
      data={sections}
      keyExtractor={item => item.key}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
      }
      renderItem={({ item }) => {
        if (item.key === 'nickname') {
          return (
            <View style={styles.section}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="Your nickname"
                placeholderTextColor={colors.onSurfaceVariant}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
                maxLength={40}
              />
              <Pressable
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          );
        }
        return (
          <View style={styles.section}>
            <Pressable
              style={[styles.buttonDestructive, loggingOut && styles.buttonDisabled]}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text style={styles.buttonDestructiveText}>Sign Out</Text>
              )}
            </Pressable>
          </View>
        );
      }}
    />
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
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
    marginBottom: -spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onBackground,
    ...typography.body1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.background,
  },
  buttonDestructive: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDestructiveText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.error,
  },
});
