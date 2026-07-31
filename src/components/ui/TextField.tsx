import { forwardRef, useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing, typography } from '../../theme';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, rightElement, onFocus, onBlur, style, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const focusProgress = useSharedValue(0);

    const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
      (e) => {
        setFocused(true);
        focusProgress.value = withTiming(1, { duration: motion.duration.fast });
        onFocus?.(e);
      },
      [focusProgress, onFocus]
    );

    const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
      (e) => {
        setFocused(false);
        focusProgress.value = withTiming(0, { duration: motion.duration.fast });
        onBlur?.(e);
      },
      [focusProgress, onBlur]
    );

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderColor: error
        ? colors.danger
        : focusProgress.value > 0
          ? colors.accentBorder
          : colors.surfaceBorder,
      shadowOpacity: focusProgress.value * 0.35,
    }));

    return (
      <View style={styles.wrapper}>
        <Text variant="footnote" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
        <Animated.View
          style={[
            styles.inputContainer,
            animatedBorderStyle,
            focused && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            style={[styles.input, style]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
        </Animated.View>
        {error ? (
          <Text variant="footnote" color={colors.danger} style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

export function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable hitSlop={12} onPress={onToggle}>
      <Text variant="footnote" color={colors.accent}>
        {visible ? 'Hide' : 'Show'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  inputContainerFocused: {
    backgroundColor: colors.backgroundElevated2,
  },
  input: {
    flex: 1,
    height: 54,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontFamily: typography.body.fontFamily,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    marginLeft: spacing.xxs,
  },
});
