import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AnimatedBackground,
  AuthContainer,
  Button,
  PasswordVisibilityToggle,
  Text,
  TextField,
} from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme';
import { isValidEmail, isValidPassword } from '../../src/lib/validation';

type FormErrors = Partial<
  Record<'companyName' | 'fullName' | 'email' | 'password' | 'confirmPassword', string>
>;

export default function SignUpScreen() {
  const { signUpWithPassword } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearFieldError = (key: keyof FormErrors) => {
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {};
    if (companyName.trim().length < 2) nextErrors.companyName = 'Enter your company name';
    if (fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name';
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!isValidPassword(password)) nextErrors.password = 'Use at least 8 characters';
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords don’t match';

    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setSubmitting(true);
    const { error } = await signUpWithPassword(
      email.trim(),
      password,
      fullName.trim(),
      companyName.trim()
    );
    setSubmitting(false);

    if (error) {
      setFormError(error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setSubmitted(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (submitted) {
    return (
      <View style={styles.confirmWrap}>
        <AnimatedBackground />
        <View style={styles.confirmInner}>
          <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.confirmIcon}>
            <Ionicons name="mail-outline" size={32} color={colors.accent} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(80)}>
            <Text variant="title2" style={styles.confirmTitle}>
              Check your inbox
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.confirmMessage}>
              We sent a confirmation link to {'\n'}
              <Text variant="headline">{email.trim()}</Text>
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(160)} style={styles.confirmAction}>
            <Button
              label="Back to Sign In"
              variant="secondary"
              onPress={() => router.replace('/(auth)')}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <AuthContainer background={<AnimatedBackground />}>
      <Animated.View entering={FadeInDown.duration(420).delay(40)}>
        <Text
          variant="footnote"
          color={colors.accent}
          onPress={() => router.back()}
          style={styles.back}
        >
          ← Back
        </Text>
        <Text variant="largeTitle" style={styles.title}>
          Create your company
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Start your CodeBook Canada Pro workspace in minutes
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.form}>
        <TextField
          label="Company name"
          placeholder="Acme Inc."
          autoCapitalize="words"
          autoComplete="organization"
          textContentType="organizationName"
          value={companyName}
          onChangeText={(t) => {
            setCompanyName(t);
            clearFieldError('companyName');
          }}
          error={fieldErrors.companyName}
          returnKeyType="next"
        />
        <TextField
          label="Full name"
          placeholder="Jordan Smith"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            clearFieldError('fullName');
          }}
          error={fieldErrors.fullName}
          returnKeyType="next"
        />
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
            clearFieldError('email');
          }}
          error={fieldErrors.email}
          returnKeyType="next"
        />
        <TextField
          label="Password"
          placeholder="At least 8 characters"
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearFieldError('password');
          }}
          error={fieldErrors.password}
          rightElement={
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          }
          returnKeyType="next"
        />
        <TextField
          label="Confirm password"
          placeholder="Re-enter your password"
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            clearFieldError('confirmPassword');
          }}
          error={fieldErrors.confirmPassword}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {formError ? (
          <View style={styles.formErrorWrap}>
            <Text variant="footnote" color={colors.danger}>
              {formError}
            </Text>
          </View>
        ) : null}

        <View style={styles.submitButton}>
          <Button label="Create Company" onPress={handleSubmit} loading={submitting} />
        </View>

        <Text variant="caption1" color={colors.textTertiary} style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </Animated.View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  back: {
    marginBottom: spacing.lg,
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
  formErrorWrap: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  terms: {
    textAlign: 'center',
    marginTop: spacing.lg,
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
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
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
