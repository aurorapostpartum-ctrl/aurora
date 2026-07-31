import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlassCard, Text } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import type { Project } from './types';

const STATUS_META: Record<Project['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: colors.success },
  in_review: { label: 'In Review', color: colors.warning },
  completed: { label: 'Completed', color: colors.accent },
  on_hold: { label: 'On Hold', color: colors.textTertiary },
};

export function ProjectRow({ project, index = 0 }: { project: Project; index?: number }) {
  const meta = STATUS_META[project.status];

  return (
    <Animated.View entering={FadeInDown.duration(360).delay(index * 50)}>
      <GlassCard style={styles.card} radiusToken="md">
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text variant="headline" numberOfLines={1} style={styles.name}>
              {project.name}
            </Text>
            <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
              <Text variant="caption2" color={meta.color}>
                {meta.label.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, project.progress))}%` },
              ]}
            />
          </View>

          <Text variant="footnote" color={colors.textTertiary} style={styles.updated}>
            {project.progress}% complete
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  inner: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  progressTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHighlight,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
  updated: {
    marginTop: spacing.xs,
  },
});
