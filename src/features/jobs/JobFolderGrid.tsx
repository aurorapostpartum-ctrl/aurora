import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EmptyState, Text } from '../../components/ui';
import { colors, spacing } from '../../theme';
import type { Job } from '../../types/domain';
import { JobFolderCard } from './JobFolderCard';

export interface JobFolderGridProps {
  jobs: Job[];
  heading: string;
  emptyMessage?: string;
}

export function JobFolderGrid({ jobs, heading, emptyMessage = 'No jobs yet' }: JobFolderGridProps) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Text variant="title3">{heading}</Text>
        <Text variant="footnote" color={colors.textTertiary}>
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>

      {jobs.length === 0 ? (
        <EmptyState icon="folder-open-outline" title={emptyMessage} />
      ) : (
        <View style={styles.grid}>
          {jobs.map((job, index) => (
            <Animated.View key={job.id} entering={FadeInDown.duration(360).delay(index * 50)} style={styles.gridItem}>
              <JobFolderCard job={job} onPress={() => router.push(`/(app)/job/${job.id}`)} />
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 320,
    maxWidth: 480,
  },
});
