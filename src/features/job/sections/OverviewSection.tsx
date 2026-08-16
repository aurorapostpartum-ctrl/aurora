import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, ProgressBar, Text } from '../../../components/ui';
import { formatDate, isWithinLastDays, personName, timeAgo } from '../../../data/selectors';
import { revisionLabel } from '../../documents/documentMeta';
import { colors, radius, spacing } from '../../../theme';
import type {
  ActivityEntry,
  Deficiency,
  Job,
  JobAnnouncement,
  JobChecklist,
  JobDocument,
  JobHazardAssessment,
  JobNote,
  JobPhoto,
  Person,
  ProjectCompletion,
} from '../../../types/domain';

interface OverviewSectionProps {
  job: Job;
  person: Person;
  documents: JobDocument[];
  checklists: JobChecklist[];
  hazards: JobHazardAssessment[];
  photos: JobPhoto[];
  deficiencies: Deficiency[];
  completion: ProjectCompletion | undefined;
  notes: JobNote[];
  announcements: JobAnnouncement[];
  activity: ActivityEntry[];
  onJump: (section: string) => void;
}

export function OverviewSection({
  job,
  person,
  documents,
  checklists,
  hazards,
  photos,
  deficiencies,
  completion,
  notes,
  announcements,
  activity,
  onJump,
}: OverviewSectionProps) {
  const isManager = person.role === 'manager';
  const pinned = announcements.filter((a) => a.pinned);

  const latestDoc = documents.length > 0 ? [...documents].sort(byLatestRevision)[0] : undefined;
  const latestDocRevision = latestDoc ? latestDoc.revisions.find((r) => r.isCurrent) ?? latestDoc.revisions[0] : undefined;

  const checklistsComplete = checklists.filter((c) => c.status === 'completed').length;
  const checklistsInProgress = checklists.filter((c) => c.status === 'in_progress').length;

  const hazardsComplete = hazards.filter((h) => h.status === 'completed').length;
  const hazardsThisWeek = hazards.filter((h) => isWithinLastDays(h.generatedAt, 7)).length;

  const deficienciesOpen = deficiencies.filter((d) => d.status !== 'complete').length;
  const deficienciesComplete = deficiencies.filter((d) => d.status === 'complete').length;

  const completionDone = completion?.checklist.filter((i) => i.done).length ?? 0;
  const completionTotal = completion?.checklist.length ?? 0;

  const latestActivity = activity[0];

  return (
    <View>
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

      <Text variant="monoLabel" color={colors.textTertiary} style={styles.gridLabel}>
        JOB FOLDER
      </Text>
      <View style={styles.grid}>
        <SectionCard
          icon="document-text-outline"
          title="Documents & Prints"
          tone={colors.accentStrong}
          primary={`${documents.length} file${documents.length === 1 ? '' : 's'}`}
          secondary={
            latestDoc && latestDocRevision
              ? `Latest: ${latestDoc.title} — ${revisionLabel(latestDocRevision.revisionNumber)}`
              : 'No documents yet'
          }
          onPress={() => onJump('documents')}
        />

        <SectionCard
          icon="checkbox-outline"
          title="Checklists"
          tone={colors.success}
          primary={`${checklists.length} total`}
          secondary={`${checklistsComplete} complete · ${checklistsInProgress} in progress`}
          progress={checklists.length ? (checklistsComplete / checklists.length) * 100 : 0}
          progressColor={colors.success}
          onPress={() => onJump('checklists')}
        />

        <SectionCard
          icon="warning-outline"
          title="Hazard Assessments"
          tone={colors.warning}
          primary={`${hazardsComplete} completed`}
          secondary={`${hazardsThisWeek} this week`}
          progress={hazards.length ? (hazardsComplete / hazards.length) * 100 : 0}
          progressColor={colors.warning}
          onPress={() => onJump('hazards')}
        />

        <SectionCard
          icon="image-outline"
          title="Photos"
          tone={colors.accentStrong}
          primary={`${photos.length} photo${photos.length === 1 ? '' : 's'}`}
          secondary="Site progress and field documentation"
          onPress={() => onJump('photos')}
        />

        <SectionCard
          icon="alert-circle-outline"
          title="Deficiencies"
          tone={deficienciesOpen > 0 ? colors.danger : colors.success}
          primary={`${deficienciesOpen} open`}
          secondary={`${deficienciesComplete} completed`}
          onPress={() => onJump('deficiencies')}
        />

        {isManager ? (
          <SectionCard
            icon="ribbon-outline"
            title="Project Completion"
            tone={colors.accentStrong}
            primary={`${completionDone} of ${completionTotal} complete`}
            secondary={completion?.isComplete ? 'Project marked complete' : 'In progress'}
            progress={completionTotal ? (completionDone / completionTotal) * 100 : 0}
            progressColor={job.tabColor}
            onPress={() => onJump('completion')}
          />
        ) : null}

        <SectionCard
          icon="time-outline"
          title="Activity History"
          tone={colors.textSecondary}
          primary={latestActivity ? `${personName(latestActivity.actorId)} ${latestActivity.summary}` : 'No activity yet'}
          secondary={latestActivity ? `${timeAgo(latestActivity.createdAt)} · ${formatDate(latestActivity.createdAt)}` : ' '}
          onPress={() => onJump('activity')}
        />
      </View>

      <View style={styles.secondaryRow}>
        <SecondaryCard
          icon="chatbubble-ellipses-outline"
          label="Notes"
          value={`${notes.length}`}
          onPress={() => onJump('notes')}
        />
        <SecondaryCard
          icon="megaphone-outline"
          label="Announcements"
          value={`${announcements.length}`}
          onPress={() => onJump('announcements')}
        />
      </View>
    </View>
  );
}

function byLatestRevision(a: JobDocument, b: JobDocument) {
  const aDate = (a.revisions.find((r) => r.isCurrent) ?? a.revisions[0])?.uploadedAt ?? '';
  const bDate = (b.revisions.find((r) => r.isCurrent) ?? b.revisions[0])?.uploadedAt ?? '';
  return new Date(bDate).getTime() - new Date(aDate).getTime();
}

function SectionCard({
  icon,
  title,
  tone,
  primary,
  secondary,
  progress,
  progressColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tone: string;
  primary: string;
  secondary: string;
  progress?: number;
  progressColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.cardPressed]} shadowToken="sm">
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIcon, { backgroundColor: `${tone}26` }]}>
              <Ionicons name={icon} size={18} color={tone} />
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
          <Text variant="headline" style={styles.cardTitle}>
            {title}
          </Text>
          <Text variant="title3" numberOfLines={1} style={styles.cardPrimary}>
            {primary}
          </Text>
          <Text variant="footnote" color={colors.textTertiary} numberOfLines={2} style={styles.cardSecondary}>
            {secondary}
          </Text>
          {typeof progress === 'number' ? (
            <ProgressBar progress={progress} fillColor={progressColor ?? tone} style={styles.cardProgress} />
          ) : null}
        </Card>
      )}
    </Pressable>
  );
}

function SecondaryCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryCardPressable}>
      <Card style={styles.secondaryCard} shadowToken="xs">
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
        <Text variant="subhead" style={styles.secondaryLabel}>
          {label}
        </Text>
        <Text variant="subhead" color={colors.textTertiary}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
    marginBottom: spacing.lg,
  },
  announcementText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  gridLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressable: {
    flexGrow: 1,
    flexBasis: 260,
    maxWidth: 400,
  },
  card: {
    padding: spacing.md,
    height: '100%',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: spacing.xs,
  },
  cardPrimary: {
    marginBottom: 2,
  },
  cardSecondary: {
    minHeight: 32,
  },
  cardProgress: {
    marginTop: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryCardPressable: {
    flexGrow: 1,
    flexBasis: 200,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
  },
  secondaryLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
