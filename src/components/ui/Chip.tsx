import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  const style = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.accentMuted : colors.surface,
    borderColor: progress.value > 0.5 ? colors.accentBorder : colors.surfaceBorder,
  }));

  const handlePress = () => {
    progress.value = withTiming(selected ? 0 : 1, { duration: motion.duration.fast });
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityState={{ selected }}>
      <Animated.View style={[styles.chip, style]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={15}
            color={selected ? colors.accent : colors.textSecondary}
            style={styles.icon}
          />
        ) : null}
        <Text variant="subhead" color={selected ? colors.textPrimary : colors.textSecondary}>
          {label}
        </Text>
        {selected ? (
          <Ionicons
            name="checkmark-circle"
            size={15}
            color={colors.accent}
            style={styles.check}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    marginRight: spacing.xxs,
  },
  check: {
    marginLeft: spacing.xxs,
  },
});
