import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, ProgressBar, Screen, StatusBadge, Text } from '../../../src/components/ui';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { useBreakpoint } from '../../../src/hooks/useBreakpoint';
import {
  activityForJob,
  checklistsForJob,
  completionForJob,
  deficienciesForJob,
  documentsForJob,
  getJob,
  getPerson,
  hazardAssessmentsForJob,
  notesForJob,
  announcementsForJob,
  photosForJob,
} from '../../../src/data/selectors';
import { AddEmployeeSheet } from '../../../src/features/job/AddEmployeeSheet';
import { JobMoreActionsSheet } from '../../../src/features/job/JobMoreActionsSheet';
import { UploadDocumentSheet } from '../../../src/features/job/UploadDocumentSheet';
import { AnnouncementsSection } from '../../../src/features/job/sections/AnnouncementsSection';
import { ChecklistsSection } from '../../../src/features/job/sections/ChecklistsSection';
import { CompletionSection } from '../../../src/features/job/sections/CompletionSection';
import { DeficienciesSection } from '../../../src/features/job/sections/DeficienciesSection';
import { DocumentsSection } from '../../../src/features/job/sections/DocumentsSection';
import { HazardsSection } from '../../../src/features/job/sections/HazardsSection';
import { NotesSection } from '../../../src/features/job/sections/NotesSection';
import { OverviewSection } from '../../../src/features/job/sections/OverviewSection';
import { PhotosSection } from '../../../src/features/job/sections/PhotosSection';
import { ActivitySection } from '../../../src/features/job/sections/ActivitySection';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing } from '../../../src/theme';
import type { JobAnnouncement, JobNote, ProjectCompletion } from '../../../src/types/domain';

type SectionKey =
  | 'overview'
  | 'documents'
  | 'checklists'
  | 'hazards'
  | 'photos'
  | 'deficiencies'
  | 'notes'
  | 'announcements'
  | 'activity'
  | 'completion';

const SECTION_LABEL: Record<SectionKey, string> = {
  overview: 'Job Folder',
  documents: 'Documents & Prints',
  checklists: 'Checklists',
  hazards: 'Hazard Assessments',
  photos: 'Photos',
  deficiencies: 'Deficiencies',
  notes: 'Notes',
  announcements: 'Announcements',
  activity: 'Activity History',
  completion: 'Project Completion',
};

// Project Completion is a management concern — employees don't get a card
// for it on the home grid, and can't reach it by deep link (search, a
// stale URL, etc.) either.
const MANAGER_ONLY_SECTIONS = new Set<SectionKey>(['completion']);

export default function JobDetailScreen() {
  const { id, section } = useLocalSearchParams<{ id: string; section?: string }>();
  const { person } = useAuth();
  const { isMobile } = useBreakpoint();
  const version = useMockDataVersion();
  const job = getJob(id);

  const isManager = person?.role === 'manager';
  const requestedSection = section as SectionKey | undefined;
  const sectionAllowed =
    requestedSection &&
    SECTION_LABEL[requestedSection] &&
    (isManager || !MANAGER_ONLY_SECTIONS.has(requestedSection));

  const [activeSection, setActiveSection] = useState<SectionKey>(
    sectionAllowed ? (requestedSection as SectionKey) : 'overview'
  );
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  const [notes, setNotes] = useState<JobNote[]>(() => (job ? notesForJob(job.id) : []));
  const [announcements, setAnnouncements] = useState<JobAnnouncement[]>(() =>
    job ? announcementsForJob(job.id) : []
  );
  const [completion, setCompletion] = useState<ProjectCompletion | undefined>(() =>
    job ? completionForJob(job.id) : undefined
  );

  const documents = job ? documentsForJob(job.id) : [];
  const checklists = job ? checklistsForJob(job.id) : [];
  const hazards = job ? hazardAssessmentsForJob(job.id) : [];
  const photos = job ? photosForJob(job.id) : [];
  const deficiencies = job ? deficienciesForJob(job.id) : [];
  const activity = useMemo(() => (job ? activityForJob(job.id) : []), [job, version]);

  if (!job || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="folder-open-outline" title="Job not found" />
      </Screen>
    );
  }

  const openDeficiencyCount = deficiencies.filter((d) => d.status !== 'complete').length;
  const jobPeople = [...job.managerIds, ...job.employeeIds]
    .map((pid) => getPerson(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 5);

  const totalCompletionItems =
    checklists.reduce((sum, c) => sum + c.items.length, 0) + hazards.reduce((sum, h) => sum + h.hazards.length, 0);
  const doneCompletionItems =
    checklists.reduce((sum, c) => sum + c.items.filter((i) => i.status !== 'pending').length, 0) +
    hazards.reduce((sum, h) => sum + h.hazards.filter((x) => x.identified).length, 0);

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
            Jobs
          </Text>
        </Pressable>

        <View style={styles.actionsRow}>
          {isManager ? (
            <>
              <HeaderAction
                icon="pencil-outline"
                label="Edit Job"
                showLabel={!isMobile}
                onPress={() => router.push(`/(app)/job-edit/${job.id}` as never)}
              />
              <HeaderAction
                icon="person-add-outline"
                label="Add Employee"
                showLabel={!isMobile}
                onPress={() => setAddEmployeeOpen(true)}
              />
            </>
          ) : null}
          <HeaderAction icon="cloud-upload-outline" label="Upload" showLabel onPress={() => setUploadDocOpen(true)} />
          {isManager ? (
            <Pressable onPress={() => setMoreActionsOpen(true)} hitSlop={10} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.folderHeaderWrap}>
        <View style={styles.folderInner}>
          <View style={[styles.folderTab, { backgroundColor: job.tabColor }]} />
          <View style={styles.folderCard}>
            <View style={styles.folderTopRow}>
              <Ionicons name="folder" size={18} color={job.tabColor} />
              <Text variant="caption1" color={colors.inkTertiary} style={styles.folderEyebrow}>
                JOB FOLDER
              </Text>
            </View>
            <Text variant="title1" color={colors.ink} style={styles.folderName}>
              {job.name}
            </Text>
            <Text variant="subhead" color={colors.inkSecondary} style={styles.folderAddress}>
              {job.address}
            </Text>

            <View style={styles.folderMetaRow}>
              <StatusBadge
                label={job.status === 'active' ? 'Active' : job.status === 'on_hold' ? 'On Hold' : 'Completed'}
                tone={job.status === 'active' ? 'success' : job.status === 'on_hold' ? 'warning' : 'ink'}
              />
              <Text variant="caption1" color={colors.inkTertiary}>
                Client: {job.client}
              </Text>
              {openDeficiencyCount > 0 ? (
                <Text variant="caption1" color={colors.danger}>
                  {openDeficiencyCount} open {openDeficiencyCount === 1 ? 'deficiency' : 'deficiencies'}
                </Text>
              ) : null}
            </View>

            <ProgressBar
              progress={job.progress}
              trackColor="rgba(29,24,16,0.10)"
              fillColor={job.tabColor}
              style={styles.progress}
            />
            <View style={styles.progressStatsRow}>
              <Text variant="title2" color={colors.ink}>
                {job.progress}%
              </Text>
              <Text variant="footnote" color={colors.inkSecondary} style={styles.progressLabel}>
                complete
              </Text>
            </View>
            {totalCompletionItems > 0 ? (
              <Text variant="footnote" color={colors.inkSecondary} style={styles.completionItemsLabel}>
                {doneCompletionItems} of {totalCompletionItems} completion items complete
              </Text>
            ) : null}

            <View style={styles.folderBottomRow}>
              <Text variant="caption1" color={colors.inkTertiary}>
                Target {formatShort(job.targetCompletionDate)}
              </Text>
              <View style={styles.avatarStack}>
                {jobPeople.map((p, index) => (
                  <Avatar
                    key={p.id}
                    initials={p.initials}
                    color={p.avatarColor}
                    size={22}
                    style={[styles.avatarOverlap, index === 0 && styles.avatarFirst]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      {activeSection !== 'overview' ? (
        <View style={styles.sectionHeaderWrap}>
          <Pressable onPress={() => setActiveSection('overview')} style={styles.sectionBackButton}>
            <Ionicons name="chevron-back" size={16} color={colors.accentStrong} />
            <Text variant="subhead" color={colors.accentStrong} style={styles.sectionBackLabel}>
              Job Folder
            </Text>
          </Pressable>
          <Text variant="title3">{SECTION_LABEL[activeSection]}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {activeSection === 'overview' ? (
            <OverviewSection
              job={job}
              person={person}
              documents={documents}
              checklists={checklists}
              hazards={hazards}
              photos={photos}
              deficiencies={deficiencies}
              completion={completion}
              notes={notes}
              announcements={announcements}
              activity={activity}
              onJump={(s) => setActiveSection(s as SectionKey)}
            />
          ) : null}
          {activeSection === 'documents' ? <DocumentsSection documents={documents} person={person} /> : null}
          {activeSection === 'checklists' ? (
            <ChecklistsSection job={job} person={person} checklists={checklists} />
          ) : null}
          {activeSection === 'hazards' ? <HazardsSection job={job} person={person} hazards={hazards} /> : null}
          {activeSection === 'photos' ? (
            <PhotosSection photos={photos} job={job} person={person} />
          ) : null}
          {activeSection === 'deficiencies' ? (
            <DeficienciesSection job={job} person={person} deficiencies={deficiencies} />
          ) : null}
          {activeSection === 'notes' ? (
            <NotesSection job={job} person={person} notes={notes} setNotes={setNotes} />
          ) : null}
          {activeSection === 'announcements' ? (
            <AnnouncementsSection
              job={job}
              person={person}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
            />
          ) : null}
          {activeSection === 'activity' ? <ActivitySection activity={activity} /> : null}
          {activeSection === 'completion' && isManager ? (
            <CompletionSection
              job={job}
              isManager={isManager}
              actorId={person.id}
              completion={completion}
              setCompletion={setCompletion}
              openDeficiencies={deficiencies.filter((d) => d.status !== 'complete')}
            />
          ) : null}
        </View>
      </ScrollView>

      {isManager ? (
        <>
          <AddEmployeeSheet
            visible={addEmployeeOpen}
            onClose={() => setAddEmployeeOpen(false)}
            job={job}
            actorId={person.id}
          />
          <JobMoreActionsSheet
            visible={moreActionsOpen}
            onClose={() => setMoreActionsOpen(false)}
            job={job}
            actorId={person.id}
            onEditJob={() => {
              setMoreActionsOpen(false);
              router.push(`/(app)/job-edit/${job.id}` as never);
            }}
            onAddEmployee={() => {
              setMoreActionsOpen(false);
              setAddEmployeeOpen(true);
            }}
          />
        </>
      ) : null}

      <UploadDocumentSheet
        visible={uploadDocOpen}
        onClose={() => setUploadDocOpen(false)}
        jobId={job.id}
        uploadedBy={person.id}
      />
    </Screen>
  );
}

function HeaderAction({
  icon,
  label,
  onPress,
  showLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showLabel: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.headerAction, !showLabel && styles.headerActionIconOnly]}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={16} color={colors.textPrimary} />
      {showLabel ? (
        <Text variant="subhead" color={colors.textPrimary} style={styles.headerActionLabel} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  backLabel: {
    marginLeft: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  headerActionIconOnly: {
    width: 36,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  headerActionLabel: {
    marginLeft: spacing.xs,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  folderHeaderWrap: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  folderInner: {
    width: '100%',
    maxWidth: 1040,
  },
  folderTab: {
    width: 96,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  folderCard: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.paperBorder,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 8,
  },
  folderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  folderEyebrow: {
    marginLeft: spacing.xxs,
    letterSpacing: 1.2,
  },
  folderName: {
    marginBottom: 2,
  },
  folderAddress: {
    marginBottom: spacing.md,
  },
  folderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  progress: {
    marginBottom: spacing.sm,
  },
  progressStatsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressLabel: {
    marginLeft: spacing.xs,
  },
  completionItemsLabel: {
    marginTop: 2,
    marginBottom: spacing.md,
  },
  folderBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarOverlap: {
    marginLeft: -6,
    borderWidth: 2,
    borderColor: colors.paper,
    backgroundColor: colors.accent,
  },
  avatarFirst: {
    marginLeft: 0,
  },
  sectionHeaderWrap: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 1040,
    marginBottom: spacing.xs,
  },
  sectionBackLabel: {
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
});
