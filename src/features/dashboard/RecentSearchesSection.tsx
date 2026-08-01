import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyRow, Text } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { SectionHeader } from './SectionHeader';
import { useLocalList } from './useLocalList';
import type { RecentSearch } from './types';

export function RecentSearchesSection() {
  const { items, hydrated } = useLocalList<RecentSearch>('dashboard.recentSearches');

  if (!hydrated) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Recent Searches" />
      {items.length === 0 ? (
        <EmptyRow icon="search-outline" message="Codes you search for will show up here" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {items.map((item) => (
            <View key={item.id} style={styles.chip}>
              <Text variant="subhead" numberOfLines={1}>
                {item.query}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  scroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginRight: spacing.xs,
  },
});
