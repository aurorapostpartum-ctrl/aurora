import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, spacing } from '../../theme';
import { Text } from './Text';

export interface LoadingStateProps {
  label?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ label = 'Loading…', size = 'large' }: LoadingStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <ActivityIndicator size={size} color={colors.accent} />
      {label ? (
        <Text variant="subhead" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Animated.View>
  );
}

export function InlineSpinner({ color = colors.accent }: { color?: string }) {
  return <ActivityIndicator size="small" color={color} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  label: {
    marginTop: spacing.sm,
  },
});
