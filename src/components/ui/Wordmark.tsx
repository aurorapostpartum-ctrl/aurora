import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Text } from './Text';

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Text variant={compact ? 'headline' : 'title2'} color={colors.textPrimary}>
          C
        </Text>
      </View>
      {!compact ? (
        <View style={styles.textBlock}>
          <Text variant="headline">CodeBook Canada</Text>
          <Text variant="caption1" color={colors.accent}>
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
  textBlock: {
    marginLeft: spacing.sm,
  },
});
