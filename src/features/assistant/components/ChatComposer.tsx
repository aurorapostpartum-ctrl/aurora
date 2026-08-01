import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
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
import { useVoiceInput } from '../useVoiceInput';

export function ChatComposer({
  onSend,
  disabled,
  onVoiceUnsupported,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  onVoiceUnsupported: () => void;
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const { state: voiceState, start: startVoice, stop: stopVoice } = useVoiceInput((transcript) => {
    setText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
  });

  useEffect(() => {
    if (voiceState === 'unsupported') {
      onVoiceUnsupported();
    }
  }, [voiceState, onVoiceUnsupported]);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(text);
    setText('');
  };

  const handleMicPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (voiceState === 'listening') {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const isListening = voiceState === 'listening';
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 700, easing: Easing.out(Easing.quad) }),
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
    opacity: isListening ? 1 - (pulse.value - 1) / 0.35 : 0,
  }));

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <Pressable onPress={handleMicPress} hitSlop={8} style={styles.micButton}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={19}
          color={isListening ? colors.accent : colors.textSecondary}
        />
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask about a code, calculation, or checklist…"
        placeholderTextColor={colors.textTertiary}
        multiline
        style={styles.input}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
      />

      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        hitSlop={8}
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
      >
        <Ionicons
          name="arrow-up"
          size={18}
          color={canSend ? colors.textOnAccent : colors.textTertiary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.backgroundElevated2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  containerFocused: {
    borderColor: colors.accentBorder,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    maxHeight: 120,
    paddingHorizontal: spacing.xs,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs : 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
  sendButtonActive: {
    backgroundColor: colors.accent,
  },
});
