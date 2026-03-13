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
import { login } from '../services/auth';
import { borderRadius, colors, spacing, typography } from '../theme';

type Props = {
  onGoToRegister: () => void;
};

const MOCK_EMAIL = 'teste123@teste.com';
const MOCK_PASSWORD = 'senha123';

export default function LoginScreen({ onGoToRegister }: Props) {
  const [email, setEmail] = useState(MOCK_EMAIL);
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
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
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
          textContentType="password"
          autoComplete="password"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        <Pressable style={styles.link} onPress={onGoToRegister}>
          <Text style={styles.linkText}>
            Don't have an account?{' '}
            <Text style={styles.linkHighlight}>Create one</Text>
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
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password.';
    }
    if (code === 'auth/invalid-email') {
      return 'Invalid email address.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Try again later.';
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
