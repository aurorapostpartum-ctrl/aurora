import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, GlassCard, Screen, StatusBadge, Text } from '../../../src/components/ui';
import { PEOPLE } from '../../../src/data/company';
import { jobsForPerson } from '../../../src/data/selectors';
import { colors, spacing } from '../../../src/theme';

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = PEOPLE.find((p) => p.id === id);

  if (!person) {
    return (
      <Screen glow={false}>
        <EmptyState icon="person-outline" title="Person not found" />
      </Screen>
    );
  }

  const jobs = jobsForPerson(person);

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.profileBlock}>
            <Avatar initials={person.initials} color={person.avatarColor} size={72} />
            <Text variant="title1" style={styles.name}>
              {person.name}
            </Text>
            <Text variant="body" color={colors.textSecondary}>
              {person.title}
            </Text>
            <View style={styles.badgeWrap}>
              <StatusBadge
                label={person.role === 'manager' ? 'Manager' : 'Employee'}
                tone={person.role === 'manager' ? 'accent' : 'neutral'}
              />
            </View>
          </View>

          <GlassCard style={styles.card}>
            <ContactRow icon="mail-outline" label={person.email} />
            <View style={styles.divider} />
            <ContactRow icon="call-outline" label={person.phone} />
          </GlassCard>

          <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            ASSIGNED JOBS
          </Text>
          <GlassCard style={styles.card}>
            {jobs.length === 0 ? (
              <View style={styles.emptyJobs}>
                <Text variant="subhead" color={colors.textTertiary}>
                  No jobs assigned
                </Text>
              </View>
            ) : (
              jobs.map((job, index) => (
                <View key={job.id}>
                  <Pressable
                    style={styles.jobRow}
                    onPress={() => router.push(`/(app)/job/${job.id}`)}
                  >
                    <View style={[styles.jobDot, { backgroundColor: job.tabColor }]} />
                    <View style={styles.jobText}>
                      <Text variant="headline" numberOfLines={1}>
                        {job.name}
                      </Text>
                      <Text variant="footnote" color={colors.textTertiary} numberOfLines={1}>
                        {job.address}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </Pressable>
                  {index < jobs.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))
            )}
          </GlassCard>
        </View>
      </ScrollView>
    </Screen>
  );
}

function ContactRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.contactRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text variant="body" style={styles.contactLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 560,
  },
  profileBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  name: {
    marginTop: spacing.md,
    marginBottom: 2,
  },
  badgeWrap: {
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  contactLabel: {
    marginLeft: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  emptyJobs: {
    padding: spacing.md,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  jobDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  jobText: {
    flex: 1,
  },
});
