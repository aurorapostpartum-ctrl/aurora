import { StyleSheet, View } from 'react-native';

import { EmptyRow, GlassCard, Text } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { SectionHeader } from './SectionHeader';
import { useLocalList } from './useLocalList';
import type { SavedCode } from './types';

export function SavedCodesSection() {
  const { items, hydrated } = useLocalList<SavedCode>('dashboard.savedCodes');

  if (!hydrated) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Saved Codes" />
      {items.length === 0 ? (
        <EmptyRow icon="bookmark-outline" message="Bookmark a code reference to save it here" />
      ) : (
        <GlassCard radiusToken="md">
          <View>
            {items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.row}>
                  <View style={styles.codeBadge}>
                    <Text variant="caption1" color={colors.accent}>
                      {item.code}
                    </Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text variant="subhead" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text variant="caption1" color={colors.textTertiary}>
                      {item.trade}
                    </Text>
                  </View>
                </View>
                {index < items.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  codeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
  },
  rowText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
});
