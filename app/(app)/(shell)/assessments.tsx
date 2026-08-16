import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, EmptyState, StatusBadge, Tabs, Text } from '../../../src/components/ui';
import { JOB_CHECKLISTS, JOB_HAZARD_ASSESSMENTS } from '../../../src/data/company';
import { formatDate, getJob } from '../../../src/data/selectors';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing } from '../../../src/theme';

type Kind = 'checklists' | 'hazards';

export default function AssessmentsScreen() {
  return (
    <RoleGate allow={['employee']}>
      <AssessmentsContent />
    </RoleGate>
  );
}

function AssessmentsContent() {
  const { person } = useAuth();
  const [kind, setKind] = useState<Kind>('checklists');

  const jobIds = useMemo(() => new Set(person?.jobIds ?? []), [person]);

  const checklists = useMemo(() => JOB_CHECKLISTS.filter((c) => jobIds.has(c.jobId)), [jobIds]);
  const hazards = useMemo(() => JOB_HAZARD_ASSESSMENTS.filter((h) => jobIds.has(h.jobId)), [jobIds]);

  const inProgressChecklists = checklists.filter((c) => c.status === 'in_progress').length;
  const inProgressHazards = hazards.filter((h) => h.status === 'in_progress').length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="largeTitle" style={styles.title}>
          Assessments
        </Text>
        <Tabs
          options={[
            { value: 'checklists', label: 'Checklists', badge: inProgressChecklists || undefined },
            { value: 'hazards', label: 'Hazard Assessments', badge: inProgressHazards || undefined },
          ]}
          value={kind}
          onChange={(v) => setKind(v as Kind)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {kind === 'checklists' ? (
            checklists.length === 0 ? (
              <EmptyState icon="checkbox-outline" title="No checklists yet" message="Generate one from inside a job." />
            ) : (
              checklists.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    router.push({ pathname: '/(app)/job/[id]', params: { id: c.jobId, section: 'checklists' } })
                  }
                >
                  <Card style={styles.card}>
                    <Text variant="headline" numberOfLines={2}>
                      {c.recordTitle}
                    </Text>
                    <Text variant="footnote" color={colors.textTertiary} style={styles.meta}>
                      {getJob(c.jobId)?.name} · {formatDate(c.generatedAt)}
                    </Text>
                    <View style={styles.badgeRow}>
                      <StatusBadge label={c.status === 'completed' ? 'Completed' : 'In Progress'} tone={c.status === 'completed' ? 'success' : 'warning'} />
                    </View>
                  </Card>
                </Pressable>
              ))
            )
          ) : hazards.length === 0 ? (
            <EmptyState icon="warning-outline" title="No hazard assessments yet" message="Generate one from inside a job." />
          ) : (
            hazards.map((h) => (
              <Pressable
                key={h.id}
                onPress={() =>
                  router.push({ pathname: '/(app)/job/[id]', params: { id: h.jobId, section: 'hazards' } })
                }
              >
                <Card style={styles.card}>
                  <Text variant="headline" numberOfLines={2}>
                    {h.recordTitle}
                  </Text>
                  <Text variant="footnote" color={colors.textTertiary} style={styles.meta}>
                    {getJob(h.jobId)?.name} · {formatDate(h.generatedAt)}
                  </Text>
                  <View style={styles.badgeRow}>
                    <StatusBadge label={h.status === 'completed' ? 'Completed' : 'In Progress'} tone={h.status === 'completed' ? 'success' : 'warning'} />
                  </View>
                </Card>
              </Pressable>
            ))
          )}
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
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.md,
    width: '100%',
    maxWidth: 1040,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  meta: {
    marginTop: 2,
  },
  badgeRow: {
    marginTop: spacing.sm,
  },
});
