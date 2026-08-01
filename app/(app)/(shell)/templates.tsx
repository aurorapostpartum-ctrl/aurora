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
  personName,
} from '../../../src/data/selectors';
import { totalItems } from '../../../src/features/templates/checklistTemplateMeta';
import { TemplateActionsSheet } from '../../../src/features/templates/TemplateActionsSheet';
import { UploadChecklistSheet } from '../../../src/features/templates/UploadChecklistSheet';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';
import type { ChecklistTemplate } from '../../../src/types/domain';

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

  if (!person) return null;

  const checklistTemplates =
    libraryTab === 'company' ? companyTemplates : libraryTab === 'mine' ? myTemplates : recentTemplates;

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
          ) : null}
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
          {kind === 'checklist' ? (
            <>
              <View style={styles.searchWrap}>
                <TextField
                  label=""
                  placeholder="Search checklist templates..."
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
                    { value: 'company', label: 'Company Templates', badge: companyTemplates.length || undefined },
                    { value: 'mine', label: 'My Templates', badge: myTemplates.length || undefined },
                    { value: 'recent', label: 'Recently Used', badge: recentTemplates.length || undefined },
                  ]}
                  value={libraryTab}
                  onChange={(v) => setLibraryTab(v as LibraryTab)}
                />
                <Chip label="Show Archived" selected={showArchived} onPress={() => setShowArchived((v) => !v)} />
              </View>

              {checklistTemplates.length === 0 ? (
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
              )}
            </>
          ) : (
            HAZARD_TEMPLATES.map((t) => {
              const count = hazardRecordsForTemplate(t.id).length;
              return (
                <Pressable key={t.id} onPress={() => router.push(`/(app)/hazard-template/${t.id}`)}>
                  <Card style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={styles.icon}>
                        <Ionicons name="warning-outline" size={18} color={colors.accentStrong} />
                      </View>
                      <View style={styles.cardText}>
                        <Text variant="headline" numberOfLines={1}>
                          {t.name}
                        </Text>
                        <Text variant="footnote" color={colors.textSecondary} numberOfLines={2}>
                          {t.description}
                        </Text>
                        <Text variant="caption1" color={colors.textTertiary} style={styles.recordCount}>
                          {count} generated for jobs
                        </Text>
                      </View>
                      <StatusBadge label={t.trade} tone="neutral" />
                    </View>
                  </Card>
                </Pressable>
              );
            })
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
              {template.visibility === 'private' ? <StatusBadge label="Private" tone="accent" /> : null}
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
