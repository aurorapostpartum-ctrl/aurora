import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, Screen, StatusBadge, Text, TextField } from '../../../src/components/ui';
import {
  DEFICIENCIES,
  DOCUMENTS,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
  JOBS,
  PEOPLE,
} from '../../../src/data/company';
import { getJob } from '../../../src/data/selectors';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing, TAB_BAR_HEIGHT } from '../../../src/theme';

type ResultKind = 'job' | 'document' | 'checklist' | 'hazard' | 'deficiency' | 'person';

interface SearchResult {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  jobId?: string;
  section?: string;
}

const KIND_META: Record<ResultKind, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  job: { icon: 'folder-open-outline', label: 'Job Folder' },
  document: { icon: 'document-text-outline', label: 'Document' },
  checklist: { icon: 'checkbox-outline', label: 'Checklist' },
  hazard: { icon: 'warning-outline', label: 'Hazard Assessment' },
  deficiency: { icon: 'alert-circle-outline', label: 'Deficiency' },
  person: { icon: 'person-outline', label: 'Person' },
};

export default function SearchScreen() {
  const { person } = useAuth();
  const [query, setQuery] = useState('');

  const scopedJobIds = useMemo(() => {
    if (!person) return new Set<string>();
    if (person.role === 'manager') return new Set(JOBS.map((j) => j.id));
    return new Set(person.jobIds);
  }, [person]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    for (const job of JOBS) {
      if (!scopedJobIds.has(job.id)) continue;
      if (job.name.toLowerCase().includes(q) || job.address.toLowerCase().includes(q)) {
        out.push({ kind: 'job', id: job.id, title: job.name, subtitle: job.address, jobId: job.id });
      }
    }

    for (const doc of DOCUMENTS) {
      if (!scopedJobIds.has(doc.jobId)) continue;
      if (doc.title.toLowerCase().includes(q) || doc.discipline.toLowerCase().includes(q)) {
        out.push({
          kind: 'document',
          id: doc.id,
          title: doc.title,
          subtitle: `${getJob(doc.jobId)?.name ?? ''} · ${doc.discipline}`,
          jobId: doc.jobId,
          section: 'documents',
        });
      }
    }

    for (const cl of JOB_CHECKLISTS) {
      if (!scopedJobIds.has(cl.jobId)) continue;
      if (cl.recordTitle.toLowerCase().includes(q) || cl.templateName.toLowerCase().includes(q)) {
        out.push({
          kind: 'checklist',
          id: cl.id,
          title: cl.templateName,
          subtitle: getJob(cl.jobId)?.name ?? '',
          jobId: cl.jobId,
          section: 'checklists',
        });
      }
    }

    for (const ha of JOB_HAZARD_ASSESSMENTS) {
      if (!scopedJobIds.has(ha.jobId)) continue;
      if (ha.recordTitle.toLowerCase().includes(q) || ha.templateName.toLowerCase().includes(q)) {
        out.push({
          kind: 'hazard',
          id: ha.id,
          title: ha.templateName,
          subtitle: getJob(ha.jobId)?.name ?? '',
          jobId: ha.jobId,
          section: 'hazards',
        });
      }
    }

    for (const d of DEFICIENCIES) {
      if (!scopedJobIds.has(d.jobId)) continue;
      if (d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)) {
        out.push({
          kind: 'deficiency',
          id: d.id,
          title: d.title,
          subtitle: `${getJob(d.jobId)?.name ?? ''} · ${d.location}`,
          jobId: d.jobId,
          section: 'deficiencies',
        });
      }
    }

    if (person?.role === 'manager') {
      for (const p of PEOPLE) {
        if (p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)) {
          out.push({ kind: 'person', id: p.id, title: p.name, subtitle: p.title });
        }
      }
    }

    return out;
  }, [query, scopedJobIds, person]);

  const handlePress = (result: SearchResult) => {
    if (result.kind === 'person') {
      router.push(`/(app)/person/${result.id}`);
      return;
    }
    if (result.jobId) {
      router.push({
        pathname: '/(app)/job/[id]',
        params: { id: result.jobId, section: result.section ?? 'overview' },
      });
    }
  };

  return (
    <Screen glow={false}>
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
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_HEIGHT + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {query.trim().length < 2 ? (
            <EmptyState
              icon="search-outline"
              title="Search the whole company"
              message="Type at least 2 characters to search jobs, documents, checklists, hazard assessments, deficiencies and people."
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon="file-tray-outline"
              title="No results"
              message={`Nothing matched “${query.trim()}”.`}
            />
          ) : (
            results.map((result) => {
              const meta = KIND_META[result.kind];
              return (
                <Pressable key={`${result.kind}-${result.id}`} onPress={() => handlePress(result)} style={styles.resultRow}>
                  <View style={styles.resultIcon}>
                    <Ionicons name={meta.icon} size={18} color={colors.accentStrong} />
                  </View>
                  <View style={styles.resultText}>
                    <Text variant="headline" numberOfLines={1}>
                      {result.title}
                    </Text>
                    <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                      {result.subtitle}
                    </Text>
                  </View>
                  <StatusBadge label={meta.label} tone="neutral" />
                </Pressable>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
