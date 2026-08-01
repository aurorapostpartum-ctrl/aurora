import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, ProgressBar, Screen, SegmentedControl, StatusBadge, Text } from '../../../src/components/ui';
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
import type {
  Deficiency,
  JobAnnouncement,
  JobChecklist,
  JobDocument,
  JobHazardAssessment,
  JobNote,
  JobPhoto,
  ProjectCompletion,
} from '../../../src/types/domain';

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

const SECTIONS: { value: SectionKey; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents & Prints' },
  { value: 'checklists', label: 'Checklists' },
  { value: 'hazards', label: 'Hazard Assessments' },
  { value: 'photos', label: 'Photos' },
  { value: 'deficiencies', label: 'Deficiencies' },
  { value: 'notes', label: 'Notes' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'activity', label: 'Activity History' },
  { value: 'completion', label: 'Project Completion' },
];

export default function JobDetailScreen() {
  const { id, section } = useLocalSearchParams<{ id: string; section?: string }>();
  const { person } = useAuth();
  const job = getJob(id);

  const [activeSection, setActiveSection] = useState<SectionKey>(
    (section as SectionKey) && SECTIONS.some((s) => s.value === section)
      ? (section as SectionKey)
      : 'overview'
  );

  const [documents, setDocuments] = useState<JobDocument[]>(() => (job ? documentsForJob(job.id) : []));
  const [checklists, setChecklists] = useState<JobChecklist[]>(() => (job ? checklistsForJob(job.id) : []));
  const [hazards, setHazards] = useState<JobHazardAssessment[]>(() =>
    job ? hazardAssessmentsForJob(job.id) : []
  );
  const [photos, setPhotos] = useState<JobPhoto[]>(() => (job ? photosForJob(job.id) : []));
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>(() =>
    job ? deficienciesForJob(job.id) : []
  );
  const [notes, setNotes] = useState<JobNote[]>(() => (job ? notesForJob(job.id) : []));
  const [announcements, setAnnouncements] = useState<JobAnnouncement[]>(() =>
    job ? announcementsForJob(job.id) : []
  );
  const [completion, setCompletion] = useState<ProjectCompletion | undefined>(() =>
    job ? completionForJob(job.id) : undefined
  );

  const activity = useMemo(() => (job ? activityForJob(job.id) : []), [job]);

  if (!job || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="folder-open-outline" title="Job not found" />
      </Screen>
    );
  }

  const isManager = person.role === 'manager';
  const openDeficiencyCount = deficiencies.filter((d) => d.status !== 'resolved').length;
  const jobPeople = [...job.managerIds, ...job.employeeIds]
    .map((pid) => getPerson(pid))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 5);

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
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
                tone={job.status === 'active' ? 'success' : job.status === 'on_hold' ? 'warning' : 'neutral'}
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
            <View style={styles.folderBottomRow}>
              <Text variant="caption1" color={colors.inkTertiary}>
                {job.progress}% complete · Target {formatShort(job.targetCompletionDate)}
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

      <View style={styles.segmentWrap}>
        <SegmentedControl
          options={SECTIONS}
          value={activeSection}
          onChange={(v) => setActiveSection(v as SectionKey)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {activeSection === 'overview' ? (
            <OverviewSection
              job={job}
              person={person}
              checklists={checklists}
              hazards={hazards}
              deficiencies={deficiencies}
              announcements={announcements}
              onJump={(s) => setActiveSection(s as SectionKey)}
            />
          ) : null}
          {activeSection === 'documents' ? (
            <DocumentsSection
              documents={documents}
              setDocuments={setDocuments}
              person={person}
            />
          ) : null}
          {activeSection === 'checklists' ? (
            <ChecklistsSection
              job={job}
              person={person}
              checklists={checklists}
              setChecklists={setChecklists}
            />
          ) : null}
          {activeSection === 'hazards' ? (
            <HazardsSection job={job} person={person} hazards={hazards} setHazards={setHazards} />
          ) : null}
          {activeSection === 'photos' ? (
            <PhotosSection photos={photos} setPhotos={setPhotos} job={job} person={person} />
          ) : null}
          {activeSection === 'deficiencies' ? (
            <DeficienciesSection
              job={job}
              person={person}
              deficiencies={deficiencies}
              setDeficiencies={setDeficiencies}
            />
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
          {activeSection === 'completion' ? (
            <CompletionSection
              job={job}
              isManager={isManager}
              completion={completion}
              setCompletion={setCompletion}
              openDeficiencyCount={openDeficiencyCount}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  backButton: {
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
    marginBottom: spacing.xs,
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
  segmentWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
