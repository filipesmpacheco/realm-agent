import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { register } from '../services/auth';
import { borderRadius, colors, spacing, typography } from '../theme';

type Props = {
  onGoToLogin: () => void;
};

export default function RegisterScreen({ onGoToLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), password);
    } catch (e: unknown) {
      setError(parseAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Realm Agent</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.onSurfaceVariant}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.onSurfaceVariant}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.onSurfaceVariant}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="new-password"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable style={styles.link} onPress={onGoToLogin}>
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.linkHighlight}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function parseAuthError(e: unknown): string {
  if (
    e !== null &&
    typeof e === 'object' &&
    'code' in e &&
    typeof (e as { code: unknown }).code === 'string'
  ) {
    const code = (e as { code: string }).code;
    if (code === 'auth/email-already-in-use') {
      return 'This email is already registered.';
    }
    if (code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Use at least 6 characters.';
    }
  }
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onBackground,
    ...typography.body1,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.background,
  },
  link: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  linkText: {
    ...typography.body2,
    color: colors.onSurfaceVariant,
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
