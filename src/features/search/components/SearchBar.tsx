import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { forwardRef, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../../theme';
import { useVoiceInput } from '../../assistant/useVoiceInput';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  onClear: () => void;
  onVoiceUnsupported: () => void;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  { value, onChangeText, onFocus, onBlur, onSubmit, onClear, onVoiceUnsupported },
  ref
) {
  const { state: voiceState, start: startVoice, stop: stopVoice } = useVoiceInput((transcript) => {
    onChangeText(transcript);
  });

  useEffect(() => {
    if (voiceState === 'unsupported') onVoiceUnsupported();
  }, [voiceState, onVoiceUnsupported]);

  const isListening = voiceState === 'listening';
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: motion.duration.fast });
    }
  }, [isListening, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isListening ? 1 - (pulse.value - 1) / 0.4 : 0,
  }));

  const handleMicPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.searchIcon} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        placeholder="Search codes, sections, or topics…"
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
      />
      {value.length > 0 ? (
        <Pressable onPress={onClear} hitSlop={8} style={styles.iconButton}>
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      ) : null}
      <Pressable onPress={handleMicPress} hitSlop={8} style={styles.iconButton}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={18}
          color={isListening ? colors.accent : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated2,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    height: '100%',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentMuted,
  },
});
