import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withTiming(0.96, { duration: motion.duration.instant });
      onPressIn?.(e);
    },
    [onPressIn, scale]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withTiming(1, { duration: motion.duration.fast });
      onPressOut?.(e);
    },
    [onPressOut, scale]
  );

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    },
    [onPress]
  );

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.base,
        sizeStyle,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} />
      ) : (
        <>
          {icon}
          <Text
            variant="headline"
            color={variantStyle.textColor}
            style={icon ? styles.labelWithIcon : undefined}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  labelWithIcon: {
    marginLeft: spacing.xs,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  md: { height: 44, paddingHorizontal: spacing.md },
  lg: { height: 54, paddingHorizontal: spacing.lg },
};

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; textColor: string }
> = {
  primary: {
    container: {
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    },
    textColor: colors.textOnAccent,
  },
  secondary: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.surfaceBorder,
    },
    textColor: colors.textPrimary,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    textColor: colors.accent,
  },
  destructive: {
    container: {
      backgroundColor: colors.dangerMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    textColor: colors.danger,
  },
};
