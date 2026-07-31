import { Link, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AnimatedBackground,
  AuthContainer,
  Button,
  Checkbox,
  GlassCard,
  PasswordVisibilityToggle,
  Text,
  TextField,
  Wordmark,
} from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { useRememberedEmail } from '../../src/features/auth/useRememberedEmail';
import { colors, spacing } from '../../src/theme';
import { isValidEmail } from '../../src/lib/validation';

export default function SignInScreen() {
  const { signInWithPassword } = useAuth();
  const { rememberedEmail, rememberMe, setRememberMe, persistEmail } = useRememberedEmail();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail);
  }, [rememberedEmail]);

  const handleSubmit = async () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (password.length === 0) nextErrors.password = 'Enter your password';
    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setSubmitting(true);
    const trimmedEmail = email.trim();
    const { error } = await signInWithPassword(trimmedEmail, password);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    persistEmail(trimmedEmail, rememberMe);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <AuthContainer centered background={<AnimatedBackground />}>
      <Animated.View entering={FadeInDown.duration(460).delay(40)} style={styles.brand}>
        <Wordmark stacked />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(460).delay(100)} style={styles.headline}>
        <Text variant="largeTitle" style={styles.title}>
          Welcome back
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Sign in to access your workspace
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(460).delay(160)} style={styles.cardWrap}>
        <GlassCard radiusToken="lg" intensity={55} style={styles.card}>
          <View style={styles.cardInner}>
            <TextField
              label="Email"
              placeholder="you@company.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
              returnKeyType="next"
            />
            <TextField
              label="Password"
              placeholder="Enter your password"
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={fieldErrors.password}
              rightElement={
                <PasswordVisibilityToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <View style={styles.optionsRow}>
              <Checkbox checked={rememberMe} onChange={setRememberMe} label="Remember me" />
              <Link href="/(auth)/forgot-password" asChild>
                <Text variant="footnote" color={colors.accent}>
                  Forgot password?
                </Text>
              </Link>
            </View>

            {formError ? (
              <View style={styles.formErrorWrap}>
                <Text variant="footnote" color={colors.danger}>
                  {formError}
                </Text>
              </View>
            ) : null}

            <Button
              label="Sign In"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.signInButton}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text variant="caption2" color={colors.textTertiary} style={styles.dividerLabel}>
                NEW TO CODEBOOK CANADA PRO
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              label="Create Company"
              variant="secondary"
              onPress={() => router.push('/(auth)/sign-up')}
            />
          </View>
        </GlassCard>
      </Animated.View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    marginBottom: spacing.lg,
  },
  headline: {
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  subtitle: {
    textAlign: 'center',
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  cardInner: {
    padding: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  formErrorWrap: {
    marginBottom: spacing.md,
  },
  signInButton: {
    marginBottom: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dividerLabel: {
    marginHorizontal: spacing.sm,
  },
});
