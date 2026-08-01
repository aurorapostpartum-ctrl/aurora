import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { ProgressBar, StatusBadge, Table, Text } from '../../components/ui';
import type { TableColumn } from '../../components/ui';
import { activityForJob, formatDate, timeAgo } from '../../data/selectors';
import { colors, radius } from '../../theme';
import type { Job } from '../../types/domain';

const STATUS_LABEL: Record<Job['status'], string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const STATUS_TONE: Record<Job['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  on_hold: 'warning',
  completed: 'neutral',
};

export interface JobsTableProps {
  jobs: Job[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  const columns: TableColumn<Job>[] = [
    {
      key: 'job',
      label: 'Job',
      flex: 3,
      render: (job) => (
        <View>
          <Text variant="subhead" numberOfLines={1}>
            {job.name}
          </Text>
          <Text variant="caption1" color={colors.textTertiary} numberOfLines={1}>
            {job.address}
          </Text>
        </View>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      flex: 1,
      render: (job) => <StatusBadge label={STATUS_LABEL[job.status]} tone={STATUS_TONE[job.status]} />,
    },
    {
      key: 'progress',
      label: 'Progress',
      flex: 1.4,
      render: (job) => (
        <View style={styles.progressCell}>
          <ProgressBar progress={job.progress} fillColor={job.tabColor} height={5} style={styles.progressBar} />
          <Text variant="caption1" color={colors.textTertiary}>
            {job.progress}%
          </Text>
        </View>
      ),
    },
    {
      key: 'employees',
      label: 'Employees',
      flex: 1,
      cellText: (job) => `${job.employeeIds.length}`,
    },
    {
      key: 'activity',
      label: 'Last Activity',
      flex: 1.2,
      cellText: (job) => {
        const latest = activityForJob(job.id)[0];
        return latest ? timeAgo(latest.createdAt) : 'No activity';
      },
    },
    {
      key: 'created',
      label: 'Created',
      flex: 1.2,
      cellText: (job) => formatDate(job.startDate),
    },
    {
      key: 'actions',
      label: '',
      width: 44,
      render: (job) => (
        <Pressable
          onPress={(e: GestureResponderEvent) => {
            e.stopPropagation?.();
            router.push(`/(app)/job-edit/${job.id}` as never);
          }}
          hitSlop={10}
          style={styles.editButton}
        >
          <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
        </Pressable>
      ),
    },
  ];

  return (
    <Table
      data={jobs}
      keyExtractor={(job) => job.id}
      onRowPress={(job) => router.push(`/(app)/job/${job.id}`)}
      columns={columns}
      emptyMessage="No jobs match these filters"
    />
  );
}

const styles = StyleSheet.create({
  progressCell: {
    minWidth: 90,
  },
  progressBar: {
    marginBottom: 4,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
