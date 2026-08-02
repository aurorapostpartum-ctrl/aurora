import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, Text, TextField } from '../../../src/components/ui';
import {
  DEFICIENCIES,
  DOCUMENTS,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
  JOBS,
  PEOPLE,
  PHOTOS,
} from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { activityForJob, getJob, personName, timeAgo } from '../../../src/data/selectors';
import { CATEGORY_LABEL, currentRevision, revisionLabel } from '../../../src/features/documents/documentMeta';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { JobChecklist, JobDocument, JobHazardAssessment } from '../../../src/types/domain';

type ResultKind = 'job' | 'document' | 'checklist' | 'hazard' | 'photo' | 'activity' | 'deficiency' | 'person';

interface SearchResult {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const KIND_META: Record<ResultKind, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  job: { icon: 'folder-open-outline', label: 'Job Folder' },
  document: { icon: 'document-text-outline', label: 'Documents' },
  checklist: { icon: 'checkbox-outline', label: 'Checklists' },
  hazard: { icon: 'warning-outline', label: 'Hazard Assessments' },
  photo: { icon: 'image-outline', label: 'Photos' },
  activity: { icon: 'time-outline', label: 'Activity History' },
  deficiency: { icon: 'alert-circle-outline', label: 'Deficiencies' },
  person: { icon: 'person-outline', label: 'People' },
};

const GROUP_ORDER: ResultKind[] = ['job', 'document', 'checklist', 'hazard', 'photo', 'activity', 'deficiency', 'person'];

// When a job matches directly (by name or address), pull in a taste of its
// other records too — capped, so one broad query can't flood the page.
const CONTEXT_CAP = 3;

function checklistTitle(c: JobChecklist): string {
  return c.status === 'completed' ? `Completed ${c.templateName}` : `${c.templateName} — In Progress`;
}

function hazardTitle(h: JobHazardAssessment): string {
  return h.status === 'completed' ? `Completed ${h.templateName}` : `${h.templateName} — In Progress`;
}

function byLatestRevision(a: JobDocument, b: JobDocument) {
  const aDate = currentRevision(a)?.uploadedAt ?? '';
  const bDate = currentRevision(b)?.uploadedAt ?? '';
  return new Date(bDate).getTime() - new Date(aDate).getTime();
}

export default function SearchScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <SearchContent />
    </RoleGate>
  );
}

function SearchContent() {
  const { person } = useAuth();
  const version = useMockDataVersion();
  const [query, setQuery] = useState('');

  const scopedJobIds = useMemo(() => {
    if (!person) return new Set<string>();
    if (person.role === 'manager') return new Set(JOBS.map((j) => j.id));
    return new Set(person.jobIds);
  }, [person]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || !person) return [];

    const out: SearchResult[] = [];
    const seen = new Set<string>();
    const openJob = (jobId: string, section: string) =>
      router.push({ pathname: '/(app)/job/[id]', params: { id: jobId, section } });

    function add(kind: ResultKind, id: string, title: string, subtitle: string, onPress: () => void) {
      const key = `${kind}-${id}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ kind, id, title, subtitle, onPress });
    }

    const matchedJobIds: string[] = [];
    for (const job of JOBS) {
      if (!scopedJobIds.has(job.id)) continue;
      if (job.name.toLowerCase().includes(q) || job.address.toLowerCase().includes(q)) {
        matchedJobIds.push(job.id);
        add('job', job.id, job.name, job.address, () => openJob(job.id, 'overview'));
      }
    }

    for (const doc of DOCUMENTS) {
      if (!scopedJobIds.has(doc.jobId)) continue;
      const categoryLabel = CATEGORY_LABEL[doc.category];
      if (doc.title.toLowerCase().includes(q) || categoryLabel.toLowerCase().includes(q)) {
        const current = currentRevision(doc);
        add(
          'document',
          doc.id,
          current ? `${doc.title} — ${revisionLabel(current.revisionNumber)}` : doc.title,
          `${getJob(doc.jobId)?.name ?? ''} · ${categoryLabel}`,
          () => router.push(`/(app)/document/${doc.id}` as never)
        );
      }
    }

    for (const cl of JOB_CHECKLISTS) {
      if (!scopedJobIds.has(cl.jobId)) continue;
      if (cl.recordTitle.toLowerCase().includes(q) || cl.templateName.toLowerCase().includes(q)) {
        add('checklist', cl.id, checklistTitle(cl), getJob(cl.jobId)?.name ?? '', () =>
          router.push(`/(app)/checklist/${cl.id}` as never)
        );
      }
    }

    for (const ha of JOB_HAZARD_ASSESSMENTS) {
      if (!scopedJobIds.has(ha.jobId)) continue;
      if (ha.recordTitle.toLowerCase().includes(q) || ha.templateName.toLowerCase().includes(q)) {
        add('hazard', ha.id, hazardTitle(ha), getJob(ha.jobId)?.name ?? '', () =>
          router.push(`/(app)/hazard-assessment/${ha.id}` as never)
        );
      }
    }

    for (const d of DEFICIENCIES) {
      if (!scopedJobIds.has(d.jobId)) continue;
      if (d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)) {
        add(
          'deficiency',
          d.id,
          d.title,
          `${getJob(d.jobId)?.name ?? ''} · ${d.location}`,
          () => router.push(`/(app)/deficiency/${d.id}` as never)
        );
      }
    }

    if (person.role === 'manager') {
      for (const p of PEOPLE) {
        if (p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) {
          add('person', p.id, p.name, p.title, () => router.push(`/(app)/person/${p.id}`));
        }
      }
    }

    // Contextual: whichever jobs matched directly also surface a taste of
    // their documents, checklists, hazard assessments, photos and activity —
    // so searching an address returns "everything about this job," not just
    // the folder itself.
    for (const jobId of matchedJobIds) {
      const jobName = getJob(jobId)?.name ?? '';

      DOCUMENTS.filter((d) => d.jobId === jobId)
        .sort(byLatestRevision)
        .slice(0, CONTEXT_CAP)
        .forEach((doc) => {
          const current = currentRevision(doc);
          add(
            'document',
            doc.id,
            current ? `${doc.title} — ${revisionLabel(current.revisionNumber)}` : doc.title,
            `${jobName} · ${CATEGORY_LABEL[doc.category]}`,
            () => router.push(`/(app)/document/${doc.id}` as never)
          );
        });

      JOB_CHECKLISTS.filter((c) => c.jobId === jobId)
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
        .slice(0, CONTEXT_CAP)
        .forEach((cl) => add('checklist', cl.id, checklistTitle(cl), jobName, () => router.push(`/(app)/checklist/${cl.id}` as never)));

      JOB_HAZARD_ASSESSMENTS.filter((h) => h.jobId === jobId)
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
        .slice(0, CONTEXT_CAP)
        .forEach((ha) => add('hazard', ha.id, hazardTitle(ha), jobName, () => router.push(`/(app)/hazard-assessment/${ha.id}` as never)));

      PHOTOS.filter((ph) => ph.jobId === jobId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, CONTEXT_CAP)
        .forEach((ph) =>
          add('photo', ph.id, ph.caption, `${jobName} · ${timeAgo(ph.uploadedAt)}`, () => openJob(jobId, 'photos'))
        );

      activityForJob(jobId).slice(0, CONTEXT_CAP).forEach((entry) =>
        add(
          'activity',
          entry.id,
          entry.summary,
          `${personName(entry.actorId)} · ${jobName} · ${timeAgo(entry.createdAt)}`,
          () => openJob(jobId, 'activity')
        )
      );
    }

    return out;
  }, [query, scopedJobIds, person, version]);

  const groups = useMemo(() => {
    const byKind = new Map<ResultKind, SearchResult[]>();
    for (const result of results) {
      const list = byKind.get(result.kind);
      if (list) list.push(result);
      else byKind.set(result.kind, [result]);
    }
    return GROUP_ORDER.map((kind) => ({ kind, items: byKind.get(kind) ?? [] })).filter((g) => g.items.length > 0);
  }, [results]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="largeTitle" style={styles.title}>
          Search
        </Text>
        <Text variant="subhead" color={colors.textSecondary}>
          Find jobs, documents, checklists, hazard assessments and more across the company.
        </Text>
      </View>

      <View style={styles.searchBarWrap}>
        <TextField
          label=""
          placeholder="Search SiteVault..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {query.trim().length < 2 ? (
            <EmptyState
              icon="search-outline"
              title="Search the whole company"
              message="Type at least 2 characters to search jobs, addresses, employees, documents, checklists and hazard assessments."
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon="file-tray-outline"
              title="No results"
              message={`Nothing matched “${query.trim()}”.`}
            />
          ) : (
            groups.map((group) => {
              const meta = KIND_META[group.kind];
              return (
                <View key={group.kind} style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Ionicons name={meta.icon} size={14} color={colors.textTertiary} />
                    <Text variant="caption1" color={colors.textTertiary} style={styles.groupLabel}>
                      {meta.label.toUpperCase()}
                    </Text>
                    <Text variant="caption1" color={colors.textTertiary}>
                      {group.items.length}
                    </Text>
                  </View>
                  {group.items.map((result) => (
                    <Pressable key={`${result.kind}-${result.id}`} onPress={result.onPress} style={styles.resultRow}>
                      <View style={styles.resultIcon}>
                        <Ionicons name={meta.icon} size={16} color={colors.accentStrong} />
                      </View>
                      <View style={styles.resultText}>
                        <Text variant="headline" numberOfLines={1}>
                          {result.title}
                        </Text>
                        <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                          {result.subtitle}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                    </Pressable>
                  ))}
                </View>
              );
            })
          )}

          {person?.role === 'manager' && query.trim().length < 2 ? (
            <View style={styles.peopleSection}>
              <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
                COMPANY DIRECTORY
              </Text>
              {PEOPLE.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.personRow}
                  onPress={() => router.push(`/(app)/person/${p.id}`)}
                >
                  <Avatar initials={p.initials} color={p.avatarColor} size={32} />
                  <View style={styles.resultText}>
                    <Text variant="subhead">{p.name}</Text>
                    <Text variant="caption1" color={colors.textTertiary}>
                      {p.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xxs,
    width: '100%',
    maxWidth: 1040,
  },
  searchBarWrap: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  groupLabel: {
    flex: 1,
    letterSpacing: 1,
    marginLeft: 2,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  resultText: {
    flex: 1,
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
  },
  peopleSection: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
