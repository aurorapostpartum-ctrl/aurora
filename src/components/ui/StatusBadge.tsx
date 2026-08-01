import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { Text } from './Text';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent' | 'ink';

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

const TONE_STYLES: Record<StatusTone, { bg: string; fg: string; border: string }> = {
  success: { bg: colors.successMuted, fg: colors.success, border: 'rgba(79,169,104,0.35)' },
  warning: { bg: colors.warningMuted, fg: colors.warning, border: 'rgba(221,165,43,0.35)' },
  danger: { bg: colors.dangerMuted, fg: colors.danger, border: 'rgba(225,92,66,0.35)' },
  accent: { bg: colors.accentMuted, fg: colors.accentStrong, border: colors.accentBorder },
  neutral: { bg: colors.surface, fg: colors.textSecondary, border: colors.surfaceBorder },
  // For the warm paper Job Folder surface, where `neutral`'s translucent-white
  // styling (built for the dark app chrome) reads as nearly invisible.
  ink: { bg: 'rgba(29,24,16,0.08)', fg: colors.ink, border: colors.paperBorder },
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const t = TONE_STYLES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={[styles.dot, { backgroundColor: t.fg }]} />
      <Text variant="caption1" color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xxs,
  },
});
