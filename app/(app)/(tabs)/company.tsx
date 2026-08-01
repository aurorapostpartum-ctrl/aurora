import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Avatar, Screen, SegmentedControl, StatusBadge, Text } from '../../../src/components/ui';
import { CHECKLIST_TEMPLATES, COMPANY, HAZARD_TEMPLATES, PEOPLE } from '../../../src/data/company';
import { checklistRecordsForTemplate, hazardRecordsForTemplate, jobsForPerson } from '../../../src/data/selectors';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing, TAB_BAR_HEIGHT } from '../../../src/theme';

type Segment = 'managers' | 'employees' | 'checklists' | 'hazards';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'managers', label: 'Managers' },
  { value: 'employees', label: 'Employees' },
  { value: 'checklists', label: 'Checklist Templates' },
  { value: 'hazards', label: 'Hazard Templates' },
];

export default function CompanyScreen() {
  const { person } = useAuth();
  const [segment, setSegment] = useState<Segment>('managers');
  const isManager = person?.role === 'manager';

  const managers = useMemo(() => PEOPLE.filter((p) => p.role === 'manager'), []);
  const employees = useMemo(() => PEOPLE.filter((p) => p.role === 'employee'), []);

  const notImplemented = (label: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    Alert.alert(label, 'This action is not available in the demo workspace yet.');
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Text variant="caption1" color={colors.textTertiary} style={styles.eyebrow}>
          {COMPANY.name.toUpperCase()}
        </Text>
        <Text variant="largeTitle" style={styles.title}>
          Company
        </Text>
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={(v) => setSegment(v as Segment)} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_HEIGHT + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {segment === 'managers' ? (
            <PeopleList
              people={managers}
              actionLabel={isManager ? 'Invite Manager' : undefined}
              onAction={() => notImplemented('Invite Manager')}
            />
          ) : null}

          {segment === 'employees' ? (
            <PeopleList
              people={employees}
              actionLabel={isManager ? 'Add Employee' : undefined}
              onAction={() => notImplemented('Add Employee')}
            />
          ) : null}

          {segment === 'checklists' ? (
            <TemplateList
              kind="checklist"
              isManager={isManager}
              onAction={() => notImplemented('New Checklist Template')}
            />
          ) : null}

          {segment === 'hazards' ? (
            <TemplateList
              kind="hazard"
              isManager={isManager}
              onAction={() => notImplemented('New Hazard Assessment Template')}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionButton}>
      <Ionicons name="add" size={16} color={colors.accentStrong} />
      <Text variant="subhead" color={colors.accentStrong} style={styles.actionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function PeopleList({
  people,
  actionLabel,
  onAction,
}: {
  people: (typeof PEOPLE);
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {people.length} {people.length === 1 ? 'person' : 'people'}
        </Text>
        {actionLabel ? <SectionAction label={actionLabel} onPress={onAction} /> : null}
      </View>
      {people.map((p) => {
        const jobs = jobsForPerson(p);
        return (
          <Pressable key={p.id} style={styles.personCard} onPress={() => router.push(`/(app)/person/${p.id}`)}>
            <Avatar initials={p.initials} color={p.avatarColor} size={44} />
            <View style={styles.personText}>
              <Text variant="headline" numberOfLines={1}>
                {p.name}
              </Text>
              <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                {p.title}
              </Text>
              <Text variant="caption1" color={colors.textTertiary} numberOfLines={1} style={styles.personJobs}>
                {jobs.length > 0 ? jobs.map((j) => j.name).join(' · ') : 'No jobs assigned'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </Pressable>
        );
      })}
    </View>
  );
}

function TemplateList({
  kind,
  isManager,
  onAction,
}: {
  kind: 'checklist' | 'hazard';
  isManager: boolean;
  onAction: () => void;
}) {
  const templates = kind === 'checklist' ? CHECKLIST_TEMPLATES : HAZARD_TEMPLATES;

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text variant="footnote" color={colors.textTertiary}>
          {templates.length} {templates.length === 1 ? 'template' : 'templates'}
        </Text>
        {isManager ? (
          <SectionAction
            label={kind === 'checklist' ? 'New Template' : 'New Template'}
            onPress={onAction}
          />
        ) : null}
      </View>
      {templates.map((t) => {
        const recordCount =
          kind === 'checklist'
            ? checklistRecordsForTemplate(t.id).length
            : hazardRecordsForTemplate(t.id).length;
        return (
          <Pressable
            key={t.id}
            style={styles.templateCard}
            onPress={() =>
              router.push(
                kind === 'checklist' ? `/(app)/checklist-template/${t.id}` : `/(app)/hazard-template/${t.id}`
              )
            }
          >
            <View style={styles.templateIcon}>
              <Ionicons
                name={kind === 'checklist' ? 'checkbox-outline' : 'warning-outline'}
                size={18}
                color={colors.accentStrong}
              />
            </View>
            <View style={styles.personText}>
              <Text variant="headline" numberOfLines={1}>
                {t.name}
              </Text>
              <Text variant="footnote" color={colors.textSecondary} numberOfLines={2}>
                {t.description}
              </Text>
              <Text variant="caption1" color={colors.textTertiary} style={styles.personJobs}>
                {recordCount} generated for jobs
              </Text>
            </View>
            <StatusBadge label={t.trade} tone="neutral" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 1.2,
    width: '100%',
    maxWidth: 1040,
  },
  title: {
    marginBottom: spacing.md,
    width: '100%',
    maxWidth: 1040,
  },
  segmentWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1040,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    marginLeft: 2,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  personText: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  personJobs: {
    marginTop: 2,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  templateIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
