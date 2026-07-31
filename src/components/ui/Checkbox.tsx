import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: motion.duration.fast });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.accent : 'transparent',
    borderColor: progress.value > 0.5 ? colors.accent : colors.surfaceBorder,
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onChange(!checked);
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={styles.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Animated.View style={[styles.box, boxStyle]}>
        {checked ? <Ionicons name="checkmark" size={13} color={colors.textOnAccent} /> : null}
      </Animated.View>
      {label ? (
        <Text variant="subhead" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: spacing.xs,
  },
});
