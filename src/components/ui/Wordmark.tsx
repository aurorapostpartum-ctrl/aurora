import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface WordmarkProps {
  compact?: boolean;
  stacked?: boolean;
}

export function Wordmark({ compact = false, stacked = false }: WordmarkProps) {
  return (
    <View style={[styles.row, stacked && styles.column]}>
      <View style={[styles.mark, compact && styles.markCompact, stacked && styles.markHero]}>
        <Text variant={compact ? 'headline' : 'title1'} color={colors.textPrimary}>
          C
        </Text>
      </View>
      {!compact ? (
        <View style={[styles.textBlock, stacked && styles.textBlockStacked]}>
          <Text variant="headline">CodeBook Canada</Text>
          <Text variant="caption1" color={colors.accent} style={stacked && styles.proStacked}>
            PRO
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  markCompact: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
  },
  markHero: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    shadowOpacity: 0.5,
    shadowRadius: 28,
  },
  textBlock: {
    marginLeft: spacing.sm,
  },
  textBlockStacked: {
    marginLeft: 0,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  proStacked: {
    textAlign: 'center',
  },
});
