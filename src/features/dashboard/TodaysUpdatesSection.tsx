import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { GlassCard, Text } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { SectionHeader } from './SectionHeader';

interface UpdateItem {
  id: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  tag: string;
}

const UPDATES: UpdateItem[] = [
  {
    id: 'ob-2026',
    title: 'CSA electrical code updates',
    body: 'The 2026 amendments are now searchable across all provinces.',
    icon: 'flash-outline',
    tag: 'Code update',
  },
  {
    id: 'ai-launch',
    title: 'AI Assistant is here',
    body: 'Ask questions in plain language and get cited code answers.',
    icon: 'sparkles-outline',
    tag: 'New feature',
  },
];

export function TodaysUpdatesSection() {
  return (
    <View style={styles.section}>
      <SectionHeader title="Today's Updates" />
      {UPDATES.map((update) => (
        <GlassCard key={update.id} radiusToken="md" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={update.icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.tagRow}>
                <Text variant="caption2" color={colors.accent}>
                  {update.tag.toUpperCase()}
                </Text>
              </View>
              <Text variant="subhead" style={styles.title}>
                {update.title}
              </Text>
              <Text variant="footnote" color={colors.textSecondary}>
                {update.body}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  tagRow: {
    marginBottom: 2,
  },
  title: {
    marginBottom: 2,
  },
});
