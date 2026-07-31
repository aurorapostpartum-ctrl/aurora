import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(420).springify().damping(18)}
      style={styles.container}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={colors.textSecondary} />
      </View>
      <Text variant="headline" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="subhead" color={colors.textSecondary} style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} variant="secondary" size="md" fullWidth={false} onPress={onAction} />
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
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
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
