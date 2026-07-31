import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EmptyState, ErrorState, Screen, SkeletonCard, Text } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { useProjects } from '../../src/features/dashboard/useProjects';
import { StatCard } from '../../src/features/dashboard/StatCard';
import { ProjectRow } from '../../src/features/dashboard/ProjectRow';
import { colors, spacing } from '../../src/theme';
import type { Project } from '../../src/features/dashboard/types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useProjects();

  const firstName = useMemo(() => {
    const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
    if (fullName) return fullName.split(' ')[0];
    return user?.email?.split('@')[0] ?? 'there';
  }, [user]);

  const stats = useMemo(() => {
    const projects = data ?? [];
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    return { total: projects.length, active, completed };
  }, [data]);

  const renderHeader = () => (
    <>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.greetingBlock}>
        <Text variant="footnote" color={colors.textSecondary}>
          Welcome back
        </Text>
        <Text variant="largeTitle" style={styles.greetingName}>
          {firstName}
        </Text>
      </Animated.View>

      {!isLoading && !isError ? (
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.statsRow}>
          <StatCard icon="albums-outline" label="Projects" value={String(stats.total)} />
          <StatCard
            icon="pulse-outline"
            label="Active"
            value={String(stats.active)}
            tint={colors.success}
          />
          <StatCard
            icon="checkmark-done-outline"
            label="Completed"
            value={String(stats.completed)}
            tint={colors.warning}
          />
        </Animated.View>
      ) : null}

      {(data?.length ?? 0) > 0 ? (
        <Text variant="headline" style={styles.sectionTitle}>
          Recent Projects
        </Text>
      ) : null}
    </>
  );

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.padded}>
          {renderHeader()}
          <View style={styles.skeletonStack}>
            <SkeletonCard />
            <View style={styles.skeletonGap} />
            <SkeletonCard />
            <View style={styles.skeletonGap} />
            <SkeletonCard />
          </View>
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <View style={styles.padded}>
          {renderHeader()}
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList<Project>
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.rowPadding}>
            <ProjectRow project={item} index={index} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.padded}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="No projects yet"
            message="Projects you create or get invited to will show up here."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  rowPadding: {
    paddingHorizontal: spacing.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  greetingBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  greetingName: {
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  skeletonStack: {
    marginTop: spacing.sm,
  },
  skeletonGap: {
    height: spacing.sm,
  },
});
