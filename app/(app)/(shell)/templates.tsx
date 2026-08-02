import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, EmptyState, StatusBadge, Tabs, Text, TextField } from '../../../src/components/ui';
import { CHECKLIST_TEMPLATES, HAZARD_TEMPLATES } from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import {
  checklistRecordsForTemplate,
  formatDate,
  hazardRecordsForTemplate,
  lastUsedAtForChecklistTemplate,
  lastUsedAtForHazardTemplate,
  personName,
} from '../../../src/data/selectors';
import { totalItems } from '../../../src/features/templates/checklistTemplateMeta';
import { totalItems as totalHazardItems } from '../../../src/features/templates/hazardTemplateMeta';
import { HazardTemplateActionsSheet } from '../../../src/features/templates/HazardTemplateActionsSheet';
import { TemplateActionsSheet } from '../../../src/features/templates/TemplateActionsSheet';
import { UploadChecklistSheet } from '../../../src/features/templates/UploadChecklistSheet';
import { UploadHazardFormSheet } from '../../../src/features/templates/UploadHazardFormSheet';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { ChecklistTemplate, HazardAssessmentTemplate } from '../../../src/types/domain';

type Kind = 'checklist' | 'hazard';
type LibraryTab = 'company' | 'mine' | 'recent';

export default function TemplatesScreen() {
  return (
    <RoleGate allow={['manager']}>
      <TemplatesContent />
    </RoleGate>
  );
}

function TemplatesContent() {
  const { person } = useAuth();
  const version = useMockDataVersion();
  const [kind, setKind] = useState<Kind>('checklist');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('company');
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<ChecklistTemplate | null>(null);
  const [uploadHazardOpen, setUploadHazardOpen] = useState(false);
  const [hazardActionsFor, setHazardActionsFor] = useState<HazardAssessmentTemplate | null>(null);

  const { companyTemplates, myTemplates, recentTemplates } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (t: ChecklistTemplate) =>
      !q || t.name.toLowerCase().includes(q) || t.trade.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const archivedOk = (t: ChecklistTemplate) => showArchived || !t.archived;

    const company = CHECKLIST_TEMPLATES.filter((t) => t.visibility === 'company' && archivedOk(t) && matches(t));
    const mine = CHECKLIST_TEMPLATES.filter((t) => person && t.createdBy === person.id && archivedOk(t) && matches(t));
    const recent = CHECKLIST_TEMPLATES.filter((t) => !t.archived && matches(t) && lastUsedAtForChecklistTemplate(t.id))
      .sort(
        (a, b) =>
          new Date(lastUsedAtForChecklistTemplate(b.id)!).getTime() -
          new Date(lastUsedAtForChecklistTemplate(a.id)!).getTime()
      );

    return { companyTemplates: company, myTemplates: mine, recentTemplates: recent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showArchived, person, version]);

  const { companyHazardTemplates, myHazardTemplates, recentHazardTemplates } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (t: HazardAssessmentTemplate) =>
      !q || t.name.toLowerCase().includes(q) || t.trade.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const archivedOk = (t: HazardAssessmentTemplate) => showArchived || !t.archived;

    const company = HAZARD_TEMPLATES.filter((t) => t.visibility === 'company' && archivedOk(t) && matches(t));
    const mine = HAZARD_TEMPLATES.filter((t) => person && t.createdBy === person.id && archivedOk(t) && matches(t));
    const recent = HAZARD_TEMPLATES.filter((t) => !t.archived && matches(t) && lastUsedAtForHazardTemplate(t.id)).sort(
      (a, b) =>
        new Date(lastUsedAtForHazardTemplate(b.id)!).getTime() - new Date(lastUsedAtForHazardTemplate(a.id)!).getTime()
    );

    return { companyHazardTemplates: company, myHazardTemplates: mine, recentHazardTemplates: recent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showArchived, person, version]);

  if (!person) return null;

  const checklistTemplates =
    libraryTab === 'company' ? companyTemplates : libraryTab === 'mine' ? myTemplates : recentTemplates;
  const hazardTemplates =
    libraryTab === 'company' ? companyHazardTemplates : libraryTab === 'mine' ? myHazardTemplates : recentHazardTemplates;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="largeTitle" style={styles.title}>
            Templates
          </Text>
          {kind === 'checklist' ? (
            <View style={styles.headerActions}>
              <Button
                label="Upload Checklist"
                variant="secondary"
                size="md"
                fullWidth={false}
                onPress={() => setUploadOpen(true)}
              />
              <Button
                label="New Template"
                size="md"
                fullWidth={false}
                onPress={() => router.push('/(app)/checklist-template-new' as never)}
              />
            </View>
          ) : (
            <View style={styles.headerActions}>
              <Button
                label="Upload Hazard Form"
                variant="secondary"
                size="md"
                fullWidth={false}
                onPress={() => setUploadHazardOpen(true)}
              />
              <Button
                label="New Template"
                size="md"
                fullWidth={false}
                onPress={() => router.push('/(app)/hazard-template-new' as never)}
              />
            </View>
          )}
        </View>
        <Tabs
          options={[
            { value: 'checklist', label: 'Checklist Templates' },
            { value: 'hazard', label: 'Hazard Assessment Templates' },
          ]}
          value={kind}
          onChange={(v) => setKind(v as Kind)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.searchWrap}>
            <TextField
              label=""
              placeholder={kind === 'checklist' ? 'Search checklist templates...' : 'Search hazard assessment templates...'}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.libraryTabsRow}>
            <Tabs
              options={[
                {
                  value: 'company',
                  label: 'Company Templates',
                  badge: (kind === 'checklist' ? companyTemplates.length : companyHazardTemplates.length) || undefined,
                },
                {
                  value: 'mine',
                  label: 'My Templates',
                  badge: (kind === 'checklist' ? myTemplates.length : myHazardTemplates.length) || undefined,
                },
                {
                  value: 'recent',
                  label: 'Recently Used',
                  badge: (kind === 'checklist' ? recentTemplates.length : recentHazardTemplates.length) || undefined,
                },
              ]}
              value={libraryTab}
              onChange={(v) => setLibraryTab(v as LibraryTab)}
            />
            {libraryTab !== 'recent' ? (
              <Chip label="Show Archived" selected={showArchived} onPress={() => setShowArchived((v) => !v)} />
            ) : null}
          </View>

          {kind === 'checklist' ? (
            checklistTemplates.length === 0 ? (
              <EmptyState
                icon="checkbox-outline"
                title={libraryTab === 'mine' ? 'No templates of yours yet' : 'No templates found'}
                message={
                  libraryTab === 'mine'
                    ? 'Create a new template or upload an existing checklist to get started.'
                    : libraryTab === 'recent'
                      ? 'Templates you generate onto jobs will show up here.'
                      : 'Try a different search, or create a new company template.'
                }
              />
            ) : (
              checklistTemplates.map((t) => (
                <ChecklistTemplateCard key={t.id} template={t} onOpenActions={() => setActionsFor(t)} />
              ))
            )
          ) : hazardTemplates.length === 0 ? (
            <EmptyState
              icon="warning-outline"
              title={libraryTab === 'mine' ? 'No templates of yours yet' : 'No templates found'}
              message={
                libraryTab === 'mine'
                  ? 'Create a new template or upload an existing hazard assessment form to get started.'
                  : libraryTab === 'recent'
                    ? 'Templates you generate onto jobs will show up here.'
                    : 'Try a different search, or create a new company template.'
              }
            />
          ) : (
            hazardTemplates.map((t) => (
              <HazardTemplateCard key={t.id} template={t} onOpenActions={() => setHazardActionsFor(t)} />
            ))
          )}
        </View>
      </ScrollView>

      <UploadChecklistSheet visible={uploadOpen} onClose={() => setUploadOpen(false)} actorId={person.id} />
      {actionsFor ? (
        <TemplateActionsSheet
          visible={Boolean(actionsFor)}
          onClose={() => setActionsFor(null)}
          template={actionsFor}
          actorId={person.id}
        />
      ) : null}
      <UploadHazardFormSheet visible={uploadHazardOpen} onClose={() => setUploadHazardOpen(false)} actorId={person.id} />
      {hazardActionsFor ? (
        <HazardTemplateActionsSheet
          visible={Boolean(hazardActionsFor)}
          onClose={() => setHazardActionsFor(null)}
          template={hazardActionsFor}
          actorId={person.id}
        />
      ) : null}
    </View>
  );
}

function ChecklistTemplateCard({ template, onOpenActions }: { template: ChecklistTemplate; onOpenActions: () => void }) {
  const usageCount = checklistRecordsForTemplate(template.id).length;

  return (
    <Pressable onPress={() => router.push(`/(app)/checklist-template/${template.id}`)}>
      <Card style={[styles.card, template.archived && styles.cardArchived]}>
        <View style={styles.cardRow}>
          <View style={styles.icon}>
            <Ionicons name="checkbox-outline" size={18} color={colors.accentStrong} />
          </View>
          <View style={styles.cardText}>
            <View style={styles.cardTitleRow}>
              <Text variant="headline" numberOfLines={1} style={styles.cardTitle}>
                {template.name}
              </Text>
              {template.archived ? <StatusBadge label="Archived" tone="neutral" /> : null}
              {template.visibility === 'private' ? <StatusBadge label="Private" tone="neutral" /> : null}
            </View>
            <View style={styles.metaRow}>
              <StatusBadge label={template.trade} tone="neutral" />
              <Text variant="caption1" color={colors.textTertiary}>
                {totalItems(template)} item{totalItems(template) === 1 ? '' : 's'}
              </Text>
              <Text variant="caption1" color={colors.textTertiary}>
                Updated {formatDate(template.updatedAt)}
              </Text>
            </View>
            <Text variant="caption1" color={colors.textTertiary} style={styles.recordCount}>
              Created by {personName(template.createdBy)} · Used {usageCount} time{usageCount === 1 ? '' : 's'}
            </Text>
          </View>
          <Pressable onPress={onOpenActions} hitSlop={10} style={styles.moreButton} accessibilityLabel={`${template.name} actions`}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

function HazardTemplateCard({
  template,
  onOpenActions,
}: {
  template: HazardAssessmentTemplate;
  onOpenActions: () => void;
}) {
  const usageCount = hazardRecordsForTemplate(template.id).length;
  const itemCount = totalHazardItems(template);

  return (
    <Pressable onPress={() => router.push(`/(app)/hazard-template/${template.id}`)}>
      <Card style={[styles.card, template.archived && styles.cardArchived]}>
        <View style={styles.cardRow}>
          <View style={styles.icon}>
            <Ionicons name="warning-outline" size={18} color={colors.accentStrong} />
          </View>
          <View style={styles.cardText}>
            <View style={styles.cardTitleRow}>
              <Text variant="headline" numberOfLines={1} style={styles.cardTitle}>
                {template.name}
              </Text>
              {template.archived ? <StatusBadge label="Archived" tone="neutral" /> : null}
              {template.visibility === 'private' ? <StatusBadge label="Private" tone="neutral" /> : null}
              {template.requiresSignature ? <StatusBadge label="Signature Required" tone="neutral" /> : null}
            </View>
            <View style={styles.metaRow}>
              <StatusBadge label={template.trade} tone="neutral" />
              <Text variant="caption1" color={colors.textTertiary}>
                {itemCount} hazard{itemCount === 1 ? '' : 's'}
              </Text>
              <Text variant="caption1" color={colors.textTertiary}>
                Updated {formatDate(template.updatedAt)}
              </Text>
            </View>
            <Text variant="caption1" color={colors.textTertiary} style={styles.recordCount}>
              Created by {personName(template.createdBy)} · Used {usageCount} time{usageCount === 1 ? '' : 's'}
            </Text>
          </View>
          <Pressable onPress={onOpenActions} hitSlop={10} style={styles.moreButton} accessibilityLabel={`${template.name} actions`}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Card>
    </Pressable>
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
  titleRow: {
    width: '100%',
    maxWidth: 1040,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  searchWrap: {
    marginBottom: spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  libraryTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardArchived: {
    opacity: 0.7,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: 2,
  },
  cardTitle: {
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: 2,
  },
  recordCount: {
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
