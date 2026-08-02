import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, GlassCard, Screen, StatusBadge, Text } from '../../../src/components/ui';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { checklistRecordsForTemplate, formatDate, getChecklistTemplate, getJob, personName } from '../../../src/data/selectors';
import { totalItems } from '../../../src/features/templates/checklistTemplateMeta';
import { TemplateActionsSheet } from '../../../src/features/templates/TemplateActionsSheet';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';

export default function ChecklistTemplateScreen() {
  return (
    <RoleGate allow={['manager']}>
      <ChecklistTemplateContent />
    </RoleGate>
  );
}

function ChecklistTemplateContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  useMockDataVersion();
  const template = getChecklistTemplate(id);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (!template || !person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="checkbox-outline" title="Template not found" />
      </Screen>
    );
  }

  const records = checklistRecordsForTemplate(template.id);
  const itemCount = totalItems(template);

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => setActionsOpen(true)} hitSlop={12} style={styles.moreButton} accessibilityLabel="More actions">
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {template.archived ? (
            <View style={styles.archivedBanner}>
              <Ionicons name="archive-outline" size={16} color={colors.textSecondary} />
              <Text variant="footnote" color={colors.textSecondary} style={styles.archivedBannerText}>
                This template is archived. It won't appear when generating a checklist on a job.
              </Text>
            </View>
          ) : null}

          <View style={styles.badgeRow}>
            <StatusBadge label={template.trade} tone="accent" />
            {template.visibility === 'private' ? <StatusBadge label="Private" tone="neutral" /> : null}
          </View>
          <Text variant="title1" style={styles.title}>
            {template.name}
          </Text>
          {template.description ? (
            <Text variant="body" color={colors.textSecondary} style={styles.description}>
              {template.description}
            </Text>
          ) : null}
          <Text variant="caption1" color={colors.textTertiary}>
            {itemCount} item{itemCount === 1 ? '' : 's'} · Updated {formatDate(template.updatedAt)} by{' '}
            {personName(template.createdBy)} · Used {records.length} time{records.length === 1 ? '' : 's'}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/(app)/checklist-template-edit/${template.id}` as never)}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.textPrimary} />
              <Text variant="subhead" style={styles.actionLabel}>
                Edit
              </Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => setActionsOpen(true)}>
              <Ionicons name="ellipsis-horizontal-outline" size={15} color={colors.textPrimary} />
              <Text variant="subhead" style={styles.actionLabel}>
                More
              </Text>
            </Pressable>
          </View>

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            CHECKLIST ({itemCount} ITEM{itemCount === 1 ? '' : 'S'})
          </Text>
          {template.sections.map((section) => (
            <View key={section.id} style={styles.sectionBlock}>
              <Text variant="footnote" color={colors.textTertiary} style={styles.sectionName}>
                {section.name.toUpperCase()}
              </Text>
              <GlassCard style={styles.card}>
                {section.items.map((item, index) => (
                  <View key={item.id}>
                    <View style={styles.itemRow}>
                      <Ionicons name="square-outline" size={16} color={colors.textTertiary} />
                      <View style={styles.itemTextWrap}>
                        <Text variant="body">{item.text}</Text>
                        {item.notes ? (
                          <Text variant="caption1" color={colors.textTertiary} style={styles.itemNotes}>
                            {item.notes}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.itemFlags}>
                        {item.required ? <StatusBadge label="Required" tone="warning" /> : null}
                        {item.requiresPhoto ? <Ionicons name="camera-outline" size={16} color={colors.textSecondary} /> : null}
                      </View>
                    </View>
                    {index < section.items.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </GlassCard>
            </View>
          ))}

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            GENERATED FOR JOBS ({records.length})
          </Text>
          {records.length === 0 ? (
            <GlassCard style={styles.card}>
              <View style={styles.emptyWrap}>
                <Text variant="subhead" color={colors.textTertiary}>
                  Not generated on any job yet
                </Text>
              </View>
            </GlassCard>
          ) : (
            <GlassCard style={styles.card}>
              {records.map((record, index) => (
                <View key={record.id}>
                  <Pressable
                    style={styles.recordRow}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/job/[id]',
                        params: { id: record.jobId, section: 'checklists' },
                      })
                    }
                  >
                    <View style={styles.recordText}>
                      <Text variant="headline" numberOfLines={1}>
                        {getJob(record.jobId)?.name}
                      </Text>
                      <Text variant="footnote" color={colors.textTertiary} numberOfLines={1}>
                        Generated by {personName(record.generatedBy)} · {formatDate(record.generatedAt)}
                      </Text>
                    </View>
                    <StatusBadge
                      label={record.status === 'completed' ? 'Completed' : 'In Progress'}
                      tone={record.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Pressable>
                  {index < records.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </GlassCard>
          )}

          <Text variant="footnote" color={colors.textTertiary} style={styles.footnote}>
            This template stays unchanged. Managers generate a job-specific copy from it inside a Job Folder, and
            the completed record lives permanently with that job.
          </Text>
        </View>
      </ScrollView>

      <TemplateActionsSheet
        visible={actionsOpen}
        onClose={() => setActionsOpen(false)}
        template={template}
        actorId={person.id}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 640,
  },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  archivedBannerText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  actionLabel: {
    marginLeft: spacing.xs,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 1,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionName: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
    letterSpacing: 1,
  },
  card: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  itemTextWrap: {
    marginLeft: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemNotes: {
    marginTop: 2,
  },
  itemFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  recordText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  emptyWrap: {
    padding: spacing.md,
  },
  footnote: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
