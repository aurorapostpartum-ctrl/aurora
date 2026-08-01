import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Chip, EmptyState, Text, TextField } from '../../../components/ui';
import { formatDate, personName } from '../../../data/selectors';
import { colors, spacing } from '../../../theme';
import type { JobDocument, Person } from '../../../types/domain';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  currentRevision,
  revisionLabel,
  reviewStateFor,
} from '../../documents/documentMeta';
import { ReviewStatusBadge } from '../../documents/ReviewStatusBadge';

interface DocumentsSectionProps {
  documents: JobDocument[];
  person: Person;
}

const ALL_CATEGORIES = 'all';

export function DocumentsSection({ documents, person }: DocumentsSectionProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (category !== ALL_CATEGORIES && doc.category !== category) return false;
      if (q && !doc.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [documents, query, category]);

  if (documents.length === 0) {
    return <EmptyState icon="document-text-outline" title="No documents yet" message="Uploaded plans, permits, and prints will show up here." />;
  }

  return (
    <View>
      <TextField
        label=""
        placeholder="Search documents..."
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <Chip label="All" selected={category === ALL_CATEGORIES} onPress={() => setCategory(ALL_CATEGORIES)} />
        {CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={category === option.value}
            onPress={() => setCategory(option.value)}
          />
        ))}
      </ScrollView>

      <Text variant="footnote" color={colors.textTertiary} style={styles.count}>
        {filtered.length} document{filtered.length === 1 ? '' : 's'}
      </Text>

      {filtered.length === 0 ? (
        <EmptyState icon="search-outline" title="No matching documents" message="Try a different search term or category." />
      ) : (
        filtered.map((doc) => {
          const current = currentRevision(doc);
          const reviewState = reviewStateFor(doc, person.id);
          return (
            <Pressable
              key={doc.id}
              onPress={() => router.push(`/(app)/document/${doc.id}` as never)}
              style={styles.rowPressable}
            >
              {({ pressed }) => (
                <Card style={[styles.row, pressed && styles.rowPressed]} shadowToken="xs">
                  <View style={styles.iconWrap}>
                    <Ionicons name={CATEGORY_ICON[doc.category]} size={18} color={colors.accentStrong} />
                  </View>
                  <View style={styles.rowBody}>
                    <View style={styles.titleRow}>
                      <Text variant="headline" numberOfLines={1} style={styles.title}>
                        {doc.title}
                      </Text>
                      <ReviewStatusBadge state={reviewState} />
                    </View>
                    <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                      {CATEGORY_LABEL[doc.category]} · {revisionLabel(current.revisionNumber)} · {doc.revisions.length} revision
                      {doc.revisions.length === 1 ? '' : 's'}
                    </Text>
                    <Text variant="footnote" color={colors.textTertiary} numberOfLines={1}>
                      Uploaded by {personName(current.uploadedBy)} · {formatDate(current.uploadedAt)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </Card>
              )}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    marginBottom: 0,
  },
  filterScroll: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterRow: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  count: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  rowPressable: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    flexShrink: 1,
  },
});
