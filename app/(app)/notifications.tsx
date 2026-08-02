import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, Screen, Text } from '../../src/components/ui';
import { markAllNotificationsRead, markNotificationRead, useMockDataVersion } from '../../src/data/mockStore';
import { formatDate, notificationsForPerson, timeAgo } from '../../src/data/selectors';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../src/theme';
import type { AppNotification, NotificationType } from '../../src/types/domain';

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  job_assignment: 'briefcase-outline',
  document_uploaded: 'document-text-outline',
  print_revision: 'document-text-outline',
  document_acknowledgment_required: 'alert-circle-outline',
  checklist_required: 'checkbox-outline',
  hazard_assessment_required: 'warning-outline',
  announcement: 'megaphone-outline',
  manager_comment: 'chatbubble-ellipses-outline',
};

function routeFor(n: AppNotification): string | undefined {
  if (!n.jobId) return undefined;
  switch (n.type) {
    case 'document_uploaded':
    case 'print_revision':
    case 'document_acknowledgment_required':
      return n.recordId ? `/(app)/document/${n.recordId}` : `/(app)/job/${n.jobId}`;
    case 'checklist_required':
      return n.recordId ? `/(app)/checklist/${n.recordId}` : `/(app)/job/${n.jobId}`;
    case 'hazard_assessment_required':
      return n.recordId ? `/(app)/hazard-assessment/${n.recordId}` : `/(app)/job/${n.jobId}`;
    case 'announcement':
      return `/(app)/job/${n.jobId}?section=announcements`;
    case 'manager_comment':
      return `/(app)/job/${n.jobId}?section=notes`;
    case 'job_assignment':
    default:
      return `/(app)/job/${n.jobId}`;
  }
}

export default function NotificationsScreen() {
  const { person } = useAuth();
  useMockDataVersion();
  const notifications = person ? notificationsForPerson(person.id) : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePress = (n: AppNotification) => {
    markNotificationRead(n.id);
    const route = routeFor(n);
    if (route) router.replace(route as never);
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Text variant="title2">Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 ? (
            <Pressable
              onPress={() => person && markAllNotificationsRead(person.id)}
              hitSlop={8}
              style={styles.markAllButton}
            >
              <Text variant="footnote" color={colors.accentStrong}>
                Mark all read
              </Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          {notifications.length === 0 ? (
            <EmptyState
              icon="notifications-outline"
              title="You're all caught up"
              message="New activity on your jobs will show up here."
            />
          ) : (
            notifications.map((n) => (
              <Pressable
                key={n.id}
                style={[styles.card, !n.read && styles.cardUnread]}
                onPress={() => handlePress(n)}
              >
                <View style={[styles.iconWrap, !n.read && styles.iconWrapUnread]}>
                  <Ionicons
                    name={TYPE_ICON[n.type]}
                    size={17}
                    color={n.read ? colors.textTertiary : colors.accentStrong}
                  />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.titleRow}>
                    <Text variant="headline" numberOfLines={1} style={styles.titleText}>
                      {n.title}
                    </Text>
                    {!n.read ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text variant="subhead" color={colors.textSecondary} style={styles.body} numberOfLines={3}>
                    {n.body}
                  </Text>
                  <Text variant="caption1" color={colors.textTertiary} style={styles.time}>
                    {timeAgo(n.createdAt)} · {formatDate(n.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  markAllButton: {
    paddingVertical: spacing.xxs,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
  },
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm,
  },
  cardUnread: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconWrapUnread: {
    backgroundColor: colors.backgroundElevated,
  },
  cardText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleText: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  body: {
    marginTop: 2,
  },
  time: {
    marginTop: spacing.xs,
  },
});
