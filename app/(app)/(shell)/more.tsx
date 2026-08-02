import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Text } from '../../../src/components/ui';
import { COMPANY } from '../../../src/data/company';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, spacing } from '../../../src/theme';

const LINKS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  href: string;
}[] = [
  { icon: 'search-outline', label: 'Search', description: 'Find jobs, documents and more', href: '/(app)/(shell)/search' },
  { icon: 'time-outline', label: 'Activity History', description: 'Timeline of activity on your jobs', href: '/(app)/activity-history' },
  { icon: 'people-outline', label: 'Employees', description: 'Company directory', href: '/(app)/(shell)/employees' },
  { icon: 'copy-outline', label: 'Templates', description: 'Checklist & hazard assessment templates', href: '/(app)/(shell)/templates' },
  { icon: 'settings-outline', label: 'Settings', description: 'Your account', href: '/(app)/settings' },
];

export default function MoreScreen() {
  return (
    <RoleGate allow={['employee']}>
      <MoreContent />
    </RoleGate>
  );
}

function MoreContent() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text variant="largeTitle" style={styles.title}>
          More
        </Text>

        <Card style={styles.companyCard}>
          <View style={styles.companyRow}>
            <View style={styles.companyIcon}>
              <Ionicons name="business-outline" size={18} color={colors.accentStrong} />
            </View>
            <View style={styles.companyText}>
              <Text variant="headline">{COMPANY.name}</Text>
              <Text variant="footnote" color={colors.textSecondary}>
                {COMPANY.trade} · {COMPANY.hqAddress}
              </Text>
            </View>
          </View>
        </Card>

        {LINKS.map((link) => (
          <Pressable key={link.label} onPress={() => router.push(link.href as never)}>
            <Card style={styles.linkCard}>
              <View style={styles.linkRow}>
                <View style={styles.linkIcon}>
                  <Ionicons name={link.icon} size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.linkText}>
                  <Text variant="headline">{link.label}</Text>
                  <Text variant="footnote" color={colors.textTertiary}>
                    {link.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 640,
  },
  title: {
    marginBottom: spacing.lg,
  },
  companyCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  companyText: {
    flex: 1,
  },
  linkCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
});
