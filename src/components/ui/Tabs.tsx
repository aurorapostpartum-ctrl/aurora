import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { Text } from './Text';

export interface TabOption {
  value: string;
  label: string;
  badge?: number;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ options, value, onChange }: TabsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.tab}>
              <View style={styles.labelRow}>
                <Text variant="subhead" color={active ? colors.textPrimary : colors.textTertiary}>
                  {option.label}
                </Text>
                {option.badge ? (
                  <View style={styles.badge}>
                    <Text variant="caption2" color={colors.textOnAccent}>
                      {option.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={[styles.indicator, active && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.baseline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginLeft: spacing.xxs,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 2,
    marginTop: spacing.xs,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: colors.accent,
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
