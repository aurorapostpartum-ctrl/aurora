import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, Screen, Text } from '../../src/components/ui';
import { formatDate, notificationsForPerson, timeAgo } from '../../src/data/selectors';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, radius, spacing } from '../../src/theme';

export default function NotificationsScreen() {
  const { person } = useAuth();
  const notifications = person ? notificationsForPerson(person.id) : [];

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Text variant="title2">Notifications</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </Pressable>
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
                style={styles.card}
                onPress={() => {
                  if (n.jobId) {
                    router.replace(`/(app)/job/${n.jobId}`);
                  }
                }}
              >
                {!n.read ? <View style={styles.unreadDot} /> : null}
                <View style={styles.cardText}>
                  <Text variant="headline" numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text variant="subhead" color={colors.textSecondary} style={styles.body}>
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  cardText: {
    flex: 1,
  },
  body: {
    marginTop: 2,
  },
  time: {
    marginTop: spacing.xs,
  },
});
