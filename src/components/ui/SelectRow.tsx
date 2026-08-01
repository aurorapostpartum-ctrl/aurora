import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface SelectRowProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectRow({ title, subtitle, selected, onPress }: SelectRowProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.accentMuted : colors.surface,
    borderColor: progress.value > 0.5 ? colors.accentBorder : colors.surfaceBorder,
  }));

  const outerStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? colors.accent : colors.surfaceBorder,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }));

  const handlePress = () => {
    progress.value = withTiming(selected ? 0 : 1, { duration: motion.duration.fast });
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={styles.pressable}
    >
      <Animated.View style={[styles.row, containerStyle]}>
        <View style={styles.textBlock}>
          <Text variant="headline">{title}</Text>
          {subtitle ? (
            <Text variant="footnote" color={colors.textSecondary} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Animated.View style={[styles.radioOuter, outerStyle]}>
          <Animated.View style={[styles.radioInner, dotStyle]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subtitle: {
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
});
