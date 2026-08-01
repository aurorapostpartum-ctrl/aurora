import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { Button, EmptyState, Screen, Text, TextField, Toast } from '../../../src/components/ui';
import { markDocumentReviewed, useMockDataVersion } from '../../../src/data/mockStore';
import { formatDate, getDocument, getJob, personName } from '../../../src/data/selectors';
import { DrawingSheet, SHEET_HEIGHT, SHEET_WIDTH } from '../../../src/features/documents/DrawingSheet';
import {
  CATEGORY_LABEL,
  currentRevision,
  revisionLabel,
  reviewStateFor,
  sheetLabelsForCategory,
} from '../../../src/features/documents/documentMeta';
import { RevisionHistorySheet } from '../../../src/features/documents/RevisionHistorySheet';
import { ReviewStatusBadge } from '../../../src/features/documents/ReviewStatusBadge';
import { UploadRevisionSheet } from '../../../src/features/documents/UploadRevisionSheet';
import { useBreakpoint } from '../../../src/hooks/useBreakpoint';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../../src/theme';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

export default function DocumentViewerScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <DocumentViewerContent />
    </RoleGate>
  );
}

function DocumentViewerContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = useAuth();
  const { isMobile } = useBreakpoint();
  useMockDataVersion();

  const doc = getDocument(id);
  const job = doc ? getJob(doc.jobId) : undefined;

  const [scale, setScale] = useState(1);
  const [page, setPage] = useState(1);
  const [viewingRevisionNumber, setViewingRevisionNumber] = useState<number | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploadRevisionOpen, setUploadRevisionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCursor, setMatchCursor] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const revision = doc
    ? (doc.revisions.find((r) => r.revisionNumber === viewingRevisionNumber) ?? currentRevision(doc))
    : undefined;

  useEffect(() => {
    setPage(1);
  }, [revision?.id]);

  if (!doc || !job || !person || !revision) {
    return (
      <Screen glow={false}>
        <EmptyState icon="document-text-outline" title="Document not found" />
      </Screen>
    );
  }

  const current = currentRevision(doc);
  const isViewingArchived = revision.revisionNumber !== current.revisionNumber;
  const reviewState = reviewStateFor(doc, person.id);
  const showReviewBanner = reviewState === 'new_revision' || reviewState === 'needs_review';

  const pageLabels = sheetLabelsForCategory(doc.category, revision.pageCount);
  const pageLabel = pageLabels[page - 1] ?? `Page ${page}`;
  const q = searchQuery.trim().toLowerCase();
  const searchMatches = q ? pageLabels.map((label, i) => ({ label, page: i + 1 })).filter((m) => m.label.toLowerCase().includes(q)) : [];

  const goBack = () => {
    router.push({ pathname: '/(app)/job/[id]', params: { id: job.id, section: 'documents' } });
  };

  const handleSelectRevision = (revisionNumber: number) => {
    setViewingRevisionNumber(revisionNumber === current.revisionNumber ? undefined : revisionNumber);
    setHistoryOpen(false);
  };

  const handleMarkReviewed = () => {
    markDocumentReviewed(doc.id, person.id);
    setToast('Marked as reviewed');
  };

  const handleZoomOut = () => setScale((s) => Math.max(ZOOM_MIN, Math.round((s - ZOOM_STEP) * 100) / 100));
  const handleZoomIn = () => setScale((s) => Math.min(ZOOM_MAX, Math.round((s + ZOOM_STEP) * 100) / 100));
  const handleZoomReset = () => setScale(1);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(revision.pageCount, p + 1));

  const handleSearchSubmit = () => {
    if (searchMatches.length === 0) return;
    setMatchCursor(0);
    setPage(searchMatches[0].page);
  };
  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const next = (matchCursor + 1) % searchMatches.length;
    setMatchCursor(next);
    setPage(searchMatches[next].page);
  };
  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const next = (matchCursor - 1 + searchMatches.length) % searchMatches.length;
    setMatchCursor(next);
    setPage(searchMatches[next].page);
  };

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      const content = [
        doc.title,
        `${CATEGORY_LABEL[doc.category]} · ${revisionLabel(revision.revisionNumber)}`,
        `Job: ${job.name}`,
        `Uploaded by ${personName(revision.uploadedBy)} on ${formatDate(revision.uploadedAt)}`,
        '',
        revision.notes,
      ].join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${doc.title.replace(/[^a-z0-9]+/gi, '-')}-rev-${revision.revisionNumber}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
    setToast('Download started');
  };

  const handleShare = async () => {
    const summary = `${doc.title} — ${revisionLabel(revision.revisionNumber)} (${job.name})`;
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: doc.title, text: summary });
          setToast('Shared');
          return;
        }
        throw new Error('web-share-unavailable');
      }
      await Share.share({ message: summary, title: doc.title });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      await Clipboard.setStringAsync(summary);
      setToast('Copied document details to clipboard');
    }
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text variant="subhead" color={colors.textPrimary} style={styles.backLabel}>
            Documents
          </Text>
        </Pressable>

        {reviewState !== 'not_required' ? (
          reviewState === 'reviewed' ? (
            <ReviewStatusBadge state={reviewState} />
          ) : (
            <Button label="Mark as Reviewed" size="md" fullWidth={false} onPress={handleMarkReviewed} style={styles.reviewButton} />
          )
        ) : null}
      </View>

      <View style={styles.titleWrap}>
        <Text variant="title2" numberOfLines={2} style={styles.title}>
          {doc.title}
        </Text>
        <View style={styles.badgeRow}>
          <Text variant="footnote" color={colors.textSecondary}>
            {CATEGORY_LABEL[doc.category]} · {job.name}
          </Text>
          <ReviewStatusBadge state={reviewState} />
        </View>
      </View>

      {showReviewBanner ? (
        <View style={styles.reviewBanner}>
          <Ionicons
            name={reviewState === 'new_revision' ? 'alert-circle' : 'information-circle'}
            size={20}
            color={colors.warning}
          />
          <View style={styles.reviewBannerText}>
            <Text variant="headline" color={colors.warning} style={styles.reviewBannerTitle}>
              {reviewState === 'new_revision' ? 'NEW REVISION AVAILABLE' : 'Review Required'}
            </Text>
            <Text variant="footnote" color={colors.textSecondary}>
              {reviewState === 'new_revision'
                ? `${revisionLabel(current.revisionNumber)} was uploaded — review it and mark it acknowledged.`
                : 'This document requires your acknowledgement.'}
            </Text>
          </View>
          <Button label="Mark as Reviewed" size="md" fullWidth={false} onPress={handleMarkReviewed} />
        </View>
      ) : null}

      {isViewingArchived ? (
        <View style={styles.archivedBanner}>
          <Ionicons name="archive-outline" size={16} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.archivedText}>
            Viewing archived {revisionLabel(revision.revisionNumber)} — read only.
          </Text>
          <Pressable onPress={() => setViewingRevisionNumber(undefined)}>
            <Text variant="footnote" color={colors.accentStrong}>
              View Current
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarScroll} contentContainerStyle={styles.toolbar}>
        <View style={styles.toolbarGroup}>
          <ToolbarButton icon="remove" onPress={handleZoomOut} accessibilityLabel="Zoom out" />
          <Pressable onPress={handleZoomReset} hitSlop={8}>
            <Text variant="footnote" color={colors.textSecondary} style={styles.zoomLabel}>
              {Math.round(scale * 100)}%
            </Text>
          </Pressable>
          <ToolbarButton icon="add" onPress={handleZoomIn} accessibilityLabel="Zoom in" />
        </View>

        <View style={styles.toolbarGroup}>
          <ToolbarButton icon="chevron-back" onPress={handlePrevPage} disabled={page <= 1} accessibilityLabel="Previous page" />
          <Text variant="footnote" color={colors.textSecondary} style={styles.pageLabel} numberOfLines={1}>
            Page {page} of {revision.pageCount}
          </Text>
          <ToolbarButton
            icon="chevron-forward"
            onPress={handleNextPage}
            disabled={page >= revision.pageCount}
            accessibilityLabel="Next page"
          />
        </View>

        <ToolbarButton icon="search" onPress={() => setSearchOpen((v) => !v)} active={searchOpen} accessibilityLabel="Search document" />
        <ToolbarButton icon="time-outline" onPress={() => setHistoryOpen(true)} accessibilityLabel="Revision history" />
        <ToolbarButton icon="download-outline" onPress={handleDownload} accessibilityLabel="Download" />
        <ToolbarButton icon="share-outline" onPress={handleShare} accessibilityLabel="Share" />
        <ToolbarButton icon="cloud-upload-outline" onPress={() => setUploadRevisionOpen(true)} accessibilityLabel="Upload new revision" />
      </ScrollView>

      {searchOpen ? (
        <View style={styles.searchRow}>
          <TextField
            label=""
            placeholder="Search this document..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={!isMobile}
            style={styles.searchInput}
          />
          <Text variant="footnote" color={colors.textTertiary} style={styles.matchCount}>
            {q ? `${searchMatches.length} match${searchMatches.length === 1 ? '' : 'es'}` : 'Search sheet names'}
          </Text>
          <ToolbarButton icon="chevron-up" onPress={handlePrevMatch} disabled={searchMatches.length === 0} accessibilityLabel="Previous match" />
          <ToolbarButton icon="chevron-down" onPress={handleNextMatch} disabled={searchMatches.length === 0} accessibilityLabel="Next match" />
        </View>
      ) : null}

      <ScrollView style={styles.canvasOuter} contentContainerStyle={styles.canvasOuterContent}>
        <ScrollView horizontal style={styles.canvasInner} contentContainerStyle={styles.canvasInnerContent}>
          <View style={{ width: SHEET_WIDTH * scale, height: SHEET_HEIGHT * scale, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: SHEET_WIDTH, height: SHEET_HEIGHT, transform: [{ scale }] }}>
              <DrawingSheet
                jobName={job.name}
                documentTitle={doc.title}
                category={doc.category}
                fileType={revision.fileType}
                revisionNumber={revision.revisionNumber}
                pageLabel={pageLabel}
                pageNumber={page}
                pageCount={revision.pageCount}
              />
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      <RevisionHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        document={doc}
        viewingRevisionNumber={revision.revisionNumber}
        onSelectRevision={handleSelectRevision}
      />
      <UploadRevisionSheet
        visible={uploadRevisionOpen}
        onClose={() => setUploadRevisionOpen(false)}
        document={doc}
        uploadedBy={person.id}
        onUploaded={() => {
          setViewingRevisionNumber(undefined);
          setToast('New revision uploaded');
        }}
      />

      {toast ? <Toast message={toast} onHide={() => setToast(null)} /> : null}
    </Screen>
  );
}

function ToolbarButton({
  icon,
  onPress,
  disabled,
  active,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={accessibilityLabel}
      style={[styles.toolbarButton, active && styles.toolbarButtonActive, disabled && styles.toolbarButtonDisabled]}
    >
      <Ionicons name={icon} size={16} color={disabled ? colors.textTertiary : active ? colors.accentStrong : colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  backLabel: {
    marginLeft: 2,
  },
  reviewButton: {
    height: 36,
  },
  titleWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(221,165,43,0.35)',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  reviewBannerText: {
    flex: 1,
  },
  reviewBannerTitle: {
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  archivedText: {
    flex: 1,
  },
  toolbarScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.xxs,
    marginRight: spacing.xs,
  },
  toolbarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginRight: spacing.xs,
  },
  toolbarButtonActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
  },
  toolbarButtonDisabled: {
    opacity: 0.4,
  },
  zoomLabel: {
    width: 44,
    textAlign: 'center',
  },
  pageLabel: {
    minWidth: 90,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  matchCount: {
    minWidth: 72,
  },
  canvasOuter: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  canvasOuterContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: spacing.lg,
  },
  canvasInner: {
    flexGrow: 0,
  },
  canvasInnerContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
