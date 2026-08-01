import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AnimatedBackground,
  AuthContainer,
  Button,
  PasswordVisibilityToggle,
  Text,
  TextField,
} from '../../src/components/ui';
import { isValidEmail, isValidPassword } from '../../src/lib/validation';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../src/theme';

export default function ResetPasswordScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();

  const emailPrefilled = Boolean(emailParam);
  const [email, setEmail] = useState(emailParam ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const nextErrors: typeof fieldErrors = {};
    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!isValidPassword(password)) {
      nextErrors.password = 'Use at least 8 characters';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords don’t match';
    }
    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setSubmitting(true);
    const { error } = await resetPassword(email, password);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setDone(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (done) {
    return (
      <View style={styles.confirmWrap}>
        <AnimatedBackground />
        <View style={styles.confirmInner}>
          <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.confirmIcon}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(80)}>
            <Text variant="title2" style={styles.confirmTitle}>
              Password updated
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.confirmMessage}>
              Sign in to {'\n'}
              <Text variant="headline">{email}</Text>
              {'\n'}with your new password.
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(160)} style={styles.confirmAction}>
            <Button label="Continue to Sign In" onPress={() => router.replace('/(auth)')} />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <AuthContainer background={<AnimatedBackground />}>
      <Animated.View entering={FadeInDown.duration(420).delay(40)}>
        <Text variant="largeTitle" style={styles.title}>
          Set a new password
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {emailPrefilled ? (
            <>
              Choose a new password for {'\n'}
              <Text variant="headline">{email}</Text>
            </>
          ) : (
            'Confirm your account email and choose a new password.'
          )}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.form}>
        {emailPrefilled ? null : (
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
        )}

        <TextField
          label="New Password"
          placeholder="At least 8 characters"
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
          rightElement={
            <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          }
          returnKeyType="next"
        />

        <TextField
          label="Confirm Password"
          placeholder="Re-enter your new password"
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          error={fieldErrors.confirmPassword}
          rightElement={
            <PasswordVisibilityToggle visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
          }
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {formError ? (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.formErrorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text variant="footnote" color={colors.danger} style={styles.formErrorText}>
              {formError}
            </Text>
          </Animated.View>
        ) : null}

        <Button label="Update Password" onPress={handleSubmit} loading={submitting} />
      </Animated.View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.sm,
  },
  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(225,92,66,0.35)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  formErrorText: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  confirmWrap: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  confirmInner: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,169,104,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  confirmMessage: {
    textAlign: 'center',
  },
  confirmAction: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
