import { Link, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AuthContainer,
  Button,
  PasswordVisibilityToggle,
  Text,
  TextField,
  Wordmark,
} from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme';
import { isValidEmail } from '../../src/lib/validation';

export default function SignInScreen() {
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

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
    const { error } = await signInWithPassword(email.trim(), password);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <AuthContainer centered>
      <Animated.View entering={FadeInDown.duration(420).delay(40)} style={styles.brand}>
        <Wordmark />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(100)}>
        <Text variant="largeTitle" style={styles.title}>
          Welcome back
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Sign in to access your workspace
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(160)} style={styles.form}>
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
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
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

        <Link href="/(auth)/forgot-password" asChild>
          <Text variant="footnote" color={colors.accent} style={styles.forgot}>
            Forgot password?
          </Text>
        </Link>

        {formError ? (
          <View style={styles.formErrorWrap}>
            <Text variant="footnote" color={colors.danger}>
              {formError}
            </Text>
          </View>
        ) : null}

        <View style={styles.submitButton}>
          <Button label="Sign In" onPress={handleSubmit} loading={submitting} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(220)} style={styles.footer}>
        <Text variant="subhead" color={colors.textSecondary}>
          Don’t have an account?
        </Text>
        <Text
          variant="subhead"
          color={colors.accent}
          style={styles.footerLink}
          onPress={() => router.push('/(auth)/sign-up')}
        >
          Create one
        </Text>
      </Animated.View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.sm,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },
  formErrorWrap: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerLink: {
    marginLeft: spacing.xxs,
  },
});
