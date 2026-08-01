import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GlassCard, Text } from '../../../components/ui';
import { colors, spacing } from '../../../theme';
import { SUGGESTED_PROMPTS } from '../suggestedPrompts';

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  const handlePress = (prompt: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(prompt);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="footnote" color={colors.textTertiary} style={styles.label}>
        TRY ASKING
      </Text>
      {SUGGESTED_PROMPTS.map((prompt, index) => (
        <Animated.View
          key={prompt}
          entering={FadeInUp.duration(320).delay(index * 60)}
          style={styles.itemWrap}
        >
          <Pressable onPress={() => handlePress(prompt)} accessibilityRole="button">
            <GlassCard radiusToken="md">
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.accent} />
                </View>
                <Text variant="subhead" style={styles.promptText}>
                  {prompt}
                </Text>
                <Ionicons name="arrow-forward" size={15} color={colors.textTertiary} />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  itemWrap: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  promptText: {
    flex: 1,
    marginRight: spacing.sm,
  },
});
