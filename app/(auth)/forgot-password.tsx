import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthContainer, Button, Text, TextField } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { isValidEmail } from '../../src/lib/validation';
import { colors, spacing } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setError(null);
    setSubmitting(true);
    const { error: resetError } = await resetPassword(email.trim());
    setSubmitting(false);

    if (resetError) {
      setError(resetError);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setSent(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (sent) {
    return (
      <View style={styles.confirmWrap}>
        <View style={styles.confirmInner}>
          <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.confirmIcon}>
            <Ionicons name="paper-plane-outline" size={30} color={colors.accent} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(80)}>
            <Text variant="title2" style={styles.confirmTitle}>
              Reset link sent
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.confirmMessage}>
              Check {'\n'}
              <Text variant="headline">{email.trim()}</Text>
              {'\n'}for instructions to reset your password.
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
    <AuthContainer>
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
          Reset password
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Enter your email and we’ll send you a link to reset your password.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.form}>
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
            if (error) setError(null);
          }}
          error={error ?? undefined}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <View style={styles.submitButton}>
          <Button label="Send Reset Link" onPress={handleSubmit} loading={submitting} />
        </View>
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
  submitButton: {
    marginTop: spacing.xs,
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
