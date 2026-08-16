import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '../../components/ui';
import { personName, timeAgo } from '../../data/selectors';
import { colors, spacing } from '../../theme';
import type { ActivityEntry, Job } from '../../types/domain';
import { pendingDocumentReviewCount } from './jobRequirements';
import type { JobRequirement } from './jobRequirements';

const TONE_COLOR: Record<JobRequirement['tone'], string> = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  neutral: colors.textSecondary,
  accent: colors.accentStrong,
  ink: colors.textPrimary,
};

export interface EmployeeJobCardProps {
  job: Job;
  requirements: JobRequirement[];
  latestActivity: ActivityEntry | undefined;
  documentCount: number;
  pendingDocumentCount: ReturnType<typeof pendingDocumentReviewCount>;
  onPress: () => void;
}

export function EmployeeJobCard({
  job,
  requirements,
  latestActivity,
  documentCount,
  pendingDocumentCount,
  onPress,
}: EmployeeJobCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable} accessibilityLabel={`Open ${job.name}`}>
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.cardPressed]} shadowToken="sm">
          <View style={[styles.tab, { backgroundColor: job.tabColor }]} />
          <Text variant="title3" numberOfLines={1} style={styles.name}>
            {job.name.toUpperCase()}
          </Text>
          <Text variant="footnote" color={colors.textSecondary} numberOfLines={1} style={styles.address}>
            {job.address}
          </Text>

          <Text variant="caption1" color={colors.textTertiary} style={styles.requirementsLabel}>
            TODAY'S REQUIREMENTS
          </Text>
          <View style={styles.requirementsList}>
            {requirements.map((req) => (
              <View key={req.id} style={styles.requirementRow}>
                <Ionicons name={req.icon} size={16} color={TONE_COLOR[req.tone]} style={styles.requirementIcon} />
                <Text variant="subhead" color={req.done ? colors.textSecondary : colors.textPrimary} numberOfLines={1} style={styles.requirementLabel}>
                  {req.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <View style={styles.footerActivity}>
              <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
              <Text variant="caption1" color={colors.textTertiary} numberOfLines={1} style={styles.footerActivityText}>
                {latestActivity
                  ? `${personName(latestActivity.actorId)} ${latestActivity.summary} · ${timeAgo(latestActivity.createdAt)}`
                  : 'No recent activity'}
              </Text>
            </View>
            <View style={styles.footerDocs}>
              <Ionicons
                name="document-text-outline"
                size={13}
                color={pendingDocumentCount > 0 ? colors.warning : colors.textTertiary}
              />
              <Text variant="caption1" color={pendingDocumentCount > 0 ? colors.warning : colors.textTertiary} style={styles.footerDocsText}>
                {pendingDocumentCount > 0
                  ? `${pendingDocumentCount} doc${pendingDocumentCount === 1 ? '' : 's'} to review`
                  : `${documentCount} doc${documentCount === 1 ? '' : 's'} up to date`}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexGrow: 1,
    flexBasis: 340,
    maxWidth: 480,
  },
  card: {
    padding: spacing.md,
    paddingTop: spacing.md + 4,
    height: '100%',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.94,
  },
  tab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 56,
    height: 5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  name: {
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  address: {
    marginBottom: spacing.md,
  },
  requirementsLabel: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  requirementsList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    marginRight: spacing.xs,
  },
  requirementLabel: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  footerActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  footerActivityText: {
    marginLeft: spacing.xxs,
    flexShrink: 1,
  },
  footerDocs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDocsText: {
    marginLeft: spacing.xxs,
  },
});
