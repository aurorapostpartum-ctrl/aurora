import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { SelectModal, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { SearchFilters } from '../types';
import {
  CODE_BOOK_FILTER_OPTIONS,
  PROVINCE_FILTER_OPTIONS,
  TRADE_FILTER_OPTIONS,
  YEAR_FILTER_OPTIONS,
} from '../filterOptions';

interface FilterDef {
  key: keyof SearchFilters;
  label: string;
  options: { label: string; value: string }[];
}

const FILTER_DEFS: FilterDef[] = [
  { key: 'province', label: 'Province', options: PROVINCE_FILTER_OPTIONS },
  { key: 'trade', label: 'Trade', options: TRADE_FILTER_OPTIONS },
  { key: 'codeBook', label: 'Code Book', options: CODE_BOOK_FILTER_OPTIONS },
  { key: 'year', label: 'Year', options: YEAR_FILTER_OPTIONS },
];

export function FilterBar({
  filters,
  onSetFilter,
  onClearFilters,
  activeFilterCount,
}: {
  filters: SearchFilters;
  onSetFilter: (key: keyof SearchFilters, value: string | null) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}) {
  const [openFilter, setOpenFilter] = useState<FilterDef | null>(null);

  const handleOpen = (def: FilterDef) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setOpenFilter(def);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_DEFS.map((def) => {
          const value = filters[def.key];
          const label = value
            ? (def.options.find((o) => o.value === value)?.label ?? def.label)
            : def.label;
          const active = Boolean(value);
          return (
            <Pressable
              key={def.key}
              onPress={() => handleOpen(def)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text variant="footnote" color={active ? colors.accent : colors.textSecondary}>
                {label}
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={active ? colors.accent : colors.textTertiary}
                style={styles.chevron}
              />
            </Pressable>
          );
        })}
        {activeFilterCount > 0 ? (
          <Pressable onPress={onClearFilters} style={styles.clearChip}>
            <Ionicons name="close" size={13} color={colors.textTertiary} />
            <Text variant="footnote" color={colors.textTertiary} style={styles.clearLabel}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <SelectModal
        visible={openFilter !== null}
        title={openFilter?.label ?? ''}
        options={openFilter?.options ?? []}
        selectedValue={openFilter ? filters[openFilter.key] : null}
        onSelect={(value) => openFilter && onSetFilter(openFilter.key, value)}
        onClose={() => setOpenFilter(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
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
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
  },
  chevron: {
    marginLeft: 4,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearLabel: {
    marginLeft: 2,
  },
});
