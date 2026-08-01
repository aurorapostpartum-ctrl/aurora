import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GlassCard, Text } from '../../../components/ui';
import { colors, spacing } from '../../../theme';
import type { CodeEntry } from '../types';

export function SuggestionsList({
  suggestions,
  onSelect,
}: {
  suggestions: CodeEntry[];
  onSelect: (entry: CodeEntry) => void;
}) {
  if (suggestions.length === 0) return null;

  const handleSelect = (entry: CodeEntry) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelect(entry);
  };

  return (
    <Animated.View entering={FadeIn.duration(160)} style={styles.wrap}>
      <GlassCard radiusToken="md">
        <View>
          {suggestions.map((entry, index) => (
            <View key={entry.id}>
              <Pressable onPress={() => handleSelect(entry)} style={styles.row}>
                <Ionicons name="search-outline" size={15} color={colors.textTertiary} />
                <Text variant="subhead" numberOfLines={1} style={styles.text}>
                  {entry.title}
                </Text>
                <Text variant="caption1" color={colors.textTertiary} numberOfLines={1}>
                  {entry.sectionRef}
                </Text>
              </Pressable>
              {index < suggestions.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  text: {
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
});
