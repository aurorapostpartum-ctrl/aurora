import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GlassCard, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { CodeEntry } from '../types';

const PROVINCE_NAMES: Record<string, string> = {
  ON: 'Ontario',
  BC: 'British Columbia',
  AB: 'Alberta',
  QC: 'Quebec',
  ALL: 'National',
};

export function SearchResultCard({
  entry,
  bookmarked,
  onToggleBookmark,
  index = 0,
}: {
  entry: CodeEntry;
  bookmarked: boolean;
  onToggleBookmark: (entry: CodeEntry) => void;
  index?: number;
}) {
  const handleBookmark = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleBookmark(entry);
  };

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(Math.min(index, 6) * 40)}>
      <GlassCard radiusToken="md" style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.sectionBadge}>
              <Text variant="caption1" color={colors.accent} numberOfLines={1}>
                {entry.sectionRef}
              </Text>
            </View>
            <Pressable
              onPress={handleBookmark}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark this result'}
            >
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={19}
                color={bookmarked ? colors.accent : colors.textTertiary}
              />
            </Pressable>
          </View>

          <Text variant="headline" style={styles.title}>
            {entry.title}
          </Text>
          <Text variant="subhead" color={colors.textSecondary} numberOfLines={3}>
            {entry.explanation}
          </Text>

          <View style={styles.metaRow}>
            <Text variant="caption1" color={colors.textTertiary} numberOfLines={1} style={styles.metaText}>
              {entry.codeBook} · {PROVINCE_NAMES[entry.province] ?? entry.province} · {entry.year}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  inner: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  metaRow: {
    marginTop: spacing.sm,
  },
  metaText: {
    textTransform: 'none',
  },
});
