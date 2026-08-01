import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, StatusBadge, Tabs, Text } from '../../../src/components/ui';
import { CHECKLIST_TEMPLATES, HAZARD_TEMPLATES } from '../../../src/data/company';
import { checklistRecordsForTemplate, hazardRecordsForTemplate } from '../../../src/data/selectors';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, spacing } from '../../../src/theme';

type Kind = 'checklist' | 'hazard';

export default function TemplatesScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <TemplatesContent />
    </RoleGate>
  );
}

function TemplatesContent() {
  const [kind, setKind] = useState<Kind>('checklist');
  const templates = kind === 'checklist' ? CHECKLIST_TEMPLATES : HAZARD_TEMPLATES;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="largeTitle" style={styles.title}>
          Templates
        </Text>
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
          {templates.map((t) => {
            const count = kind === 'checklist' ? checklistRecordsForTemplate(t.id).length : hazardRecordsForTemplate(t.id).length;
            return (
              <Pressable
                key={t.id}
                onPress={() =>
                  router.push(
                    kind === 'checklist' ? `/(app)/checklist-template/${t.id}` : `/(app)/hazard-template/${t.id}`
                  )
                }
              >
                <Card style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.icon}>
                      <Ionicons name={kind === 'checklist' ? 'checkbox-outline' : 'warning-outline'} size={18} color={colors.accentStrong} />
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
          })}
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
  recordCount: {
    marginTop: 2,
  },
});
