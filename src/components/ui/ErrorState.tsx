import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { Button } from './Button';
import { Text } from './Text';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn’t load this right now. Please try again.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(420).springify().damping(18)}
      style={styles.container}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle-outline" size={30} color={colors.danger} />
      </View>
      <Text variant="headline" style={styles.title}>
        {title}
      </Text>
      <Text variant="subhead" color={colors.textSecondary} style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button label={retryLabel} variant="secondary" size="md" fullWidth={false} onPress={onRetry} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: spacing.xxs,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.lg,
  },
});
