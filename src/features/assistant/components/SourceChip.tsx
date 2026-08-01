import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { SourceReference } from '../types';

export function SourceChip({ source }: { source: SourceReference }) {
  return (
    <View style={styles.chip}>
      <Ionicons name="document-text-outline" size={13} color={colors.accent} />
      <View style={styles.textBlock}>
        <Text variant="caption1" color={colors.textPrimary} numberOfLines={1}>
          {source.label}
        </Text>
        <Text variant="caption2" color={colors.textTertiary} numberOfLines={1}>
          {source.snippet}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    maxWidth: 220,
  },
  textBlock: {
    marginLeft: spacing.xxs,
    flexShrink: 1,
  },
});
