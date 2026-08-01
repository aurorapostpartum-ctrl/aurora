import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import { POPULAR_SEARCHES } from '../popularSearches';
import type { RecentSearch } from '../../dashboard/types';

export function RecentPopularSearches({
  recentSearches,
  onSelect,
  onRemoveRecent,
}: {
  recentSearches: RecentSearch[];
  onSelect: (term: string) => void;
  onRemoveRecent: (id: string) => void;
}) {
  const handleSelect = (term: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(term);
  };

  return (
    <View>
      {recentSearches.length > 0 ? (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.section}>
          <Text variant="footnote" color={colors.textTertiary} style={styles.label}>
            RECENT SEARCHES
          </Text>
          {recentSearches.map((item) => (
            <View key={item.id} style={styles.recentRow}>
              <Pressable
                onPress={() => handleSelect(item.query)}
                style={styles.recentRowTouchable}
              >
                <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                <Text variant="subhead" numberOfLines={1} style={styles.recentText}>
                  {item.query}
                </Text>
              </Pressable>
              <Pressable onPress={() => onRemoveRecent(item.id)} hitSlop={10}>
                <Ionicons name="close" size={16} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInUp.duration(300).delay(60)} style={styles.section}>
        <Text variant="footnote" color={colors.textTertiary} style={styles.label}>
          POPULAR SEARCHES
        </Text>
        <View style={styles.chipsWrap}>
          {POPULAR_SEARCHES.map((term) => (
            <Pressable key={term} onPress={() => handleSelect(term)} style={styles.chip}>
              <Ionicons name="trending-up-outline" size={13} color={colors.accent} />
              <Text variant="footnote" color={colors.textPrimary} style={styles.chipLabel}>
                {term}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  recentRowTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  recentText: {
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  chipLabel: {
    marginLeft: spacing.xxs,
  },
});
