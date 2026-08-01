import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassCard, StatusBadge, Text } from '../../../components/ui';
import { formatDate } from '../../../data/selectors';
import { colors, radius, spacing } from '../../../theme';
import type {
  Deficiency,
  Job,
  JobAnnouncement,
  JobChecklist,
  JobHazardAssessment,
  Person,
} from '../../../types/domain';

interface OverviewSectionProps {
  job: Job;
  person: Person;
  checklists: JobChecklist[];
  hazards: JobHazardAssessment[];
  deficiencies: Deficiency[];
  announcements: JobAnnouncement[];
  onJump: (section: string) => void;
}

export function OverviewSection({
  job,
  checklists,
  hazards,
  deficiencies,
  announcements,
  onJump,
}: OverviewSectionProps) {
  const checklistsDone = checklists.filter((c) => c.status === 'completed').length;
  const hazardsDone = hazards.filter((h) => h.status === 'completed').length;
  const openDeficiencies = deficiencies.filter((d) => d.status !== 'resolved').length;
  const pinned = announcements.filter((a) => a.pinned);

  return (
    <View>
      <GlassCard style={styles.card}>
        <View style={styles.cardBody}>
          <Text variant="caption1" color={colors.textTertiary} style={styles.label}>
            DESCRIPTION
          </Text>
          <Text variant="body" color={colors.textSecondary}>
            {job.description}
          </Text>

          <View style={styles.infoGrid}>
            <InfoItem label="Client" value={job.client} />
            <InfoItem label="Start Date" value={formatDate(job.startDate)} />
            <InfoItem label="Target Completion" value={formatDate(job.targetCompletionDate)} />
            <InfoItem label="Address" value={job.address} />
          </View>
        </View>
      </GlassCard>

      {pinned.length > 0 ? (
        <Pressable onPress={() => onJump('announcements')}>
          {pinned.map((a) => (
            <View key={a.id} style={styles.announcementCard}>
              <Ionicons name="megaphone-outline" size={16} color={colors.accentStrong} />
              <View style={styles.announcementText}>
                <Text variant="headline" numberOfLines={1}>
                  {a.title}
                </Text>
                <Text variant="footnote" color={colors.textSecondary} numberOfLines={2}>
                  {a.body}
                </Text>
              </View>
            </View>
          ))}
        </Pressable>
      ) : null}

      <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
        JOB FOLDER SECTIONS
      </Text>
      <View style={styles.quickGrid}>
        <QuickTile
          icon="checkbox-outline"
          label="Checklists"
          value={`${checklistsDone}/${checklists.length} complete`}
          onPress={() => onJump('checklists')}
        />
        <QuickTile
          icon="warning-outline"
          label="Hazard Assessments"
          value={`${hazardsDone}/${hazards.length} complete`}
          onPress={() => onJump('hazards')}
        />
        <QuickTile
          icon="alert-circle-outline"
          label="Deficiencies"
          value={`${openDeficiencies} open`}
          tone={openDeficiencies > 0 ? colors.danger : colors.textSecondary}
          onPress={() => onJump('deficiencies')}
        />
        <QuickTile
          icon="document-text-outline"
          label="Documents & Prints"
          value="View current revisions"
          onPress={() => onJump('documents')}
        />
      </View>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text variant="caption1" color={colors.textTertiary}>
        {label.toUpperCase()}
      </Text>
      <Text variant="subhead" style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function QuickTile({
  icon,
  label,
  value,
  tone = colors.textSecondary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickTile}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={18} color={colors.accentStrong} />
      </View>
      <Text variant="headline" style={styles.quickLabel}>
        {label}
      </Text>
      <Text variant="footnote" color={tone}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardBody: {
    padding: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  infoItem: {
    minWidth: 160,
  },
  infoValue: {
    marginTop: 2,
  },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
    marginBottom: spacing.md,
  },
  announcementText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickTile: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: {
    marginBottom: 2,
  },
});
