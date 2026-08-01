import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../../theme';
import { GlassCard } from './GlassCard';
import { Text } from './Text';

export function Toast({
  message,
  onHide,
  bottomOffset = 0,
}: {
  message: string;
  onHide: () => void;
  bottomOffset?: number;
}) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onHide, 2200);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      style={[styles.wrap, { bottom: insets.bottom + bottomOffset + spacing.lg }]}
    >
      <GlassCard radiusToken="pill" intensity={60} style={styles.card}>
        <Text variant="subhead" color={colors.textPrimary} style={styles.text}>
          {message}
        </Text>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  card: {
    borderRadius: radius.pill,
  },
  text: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
});
