import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, SelectModal, Text, TextField } from '../../../src/components/ui';
import { JOBS, PEOPLE, PROJECT_TYPES } from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { JobFolderGrid } from '../../../src/features/jobs/JobFolderGrid';
import { JobsTable } from '../../../src/features/jobs/JobsTable';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, radius, spacing } from '../../../src/theme';
import type { ProjectType } from '../../../src/types/domain';

type StatusFilter = 'all' | 'active' | 'completed';
type ViewMode = 'grid' | 'list';

const ALL_TYPES = 'all';
const ALL_MANAGERS = 'all';

export default function JobsScreen() {
  return (
    <RoleGate allow={['manager']}>
      <JobsContent />
    </RoleGate>
  );
}

function JobsContent() {
  const version = useMockDataVersion();
  const managers = PEOPLE.filter((p) => p.role === 'manager');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ProjectType | typeof ALL_TYPES>(ALL_TYPES);
  const [managerFilter, setManagerFilter] = useState<string>(ALL_MANAGERS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [managerPickerOpen, setManagerPickerOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((job) => {
      if (statusFilter === 'active' && job.status !== 'active') return false;
      if (statusFilter === 'completed' && job.status !== 'completed') return false;
      if (typeFilter !== ALL_TYPES && job.projectType !== typeFilter) return false;
      if (managerFilter !== ALL_MANAGERS && !job.managerIds.includes(managerFilter)) return false;
      if (q) {
        const haystack = `${job.name} ${job.address} ${job.client}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, typeFilter, managerFilter, version]);

  const typeLabel = typeFilter === ALL_TYPES ? 'All Types' : typeFilter;
  const managerLabel =
    managerFilter === ALL_MANAGERS ? 'All Managers' : managers.find((m) => m.id === managerFilter)?.name ?? 'All Managers';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text variant="largeTitle">Jobs</Text>
          <Button
            label="New Job"
            icon={<Ionicons name="add" size={18} color={colors.textOnAccent} style={styles.newJobIcon} />}
            fullWidth={false}
            onPress={() => router.push('/(app)/job-new' as never)}
          />
        </View>

        <TextField
          label=""
          placeholder="Search jobs by name, address, or client..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />

        <View style={styles.filterRow}>
          <View style={styles.statusChips}>
            <Chip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
            <Chip label="Active" selected={statusFilter === 'active'} onPress={() => setStatusFilter('active')} />
            <Chip label="Completed" selected={statusFilter === 'completed'} onPress={() => setStatusFilter('completed')} />
          </View>

          <View style={styles.filterButtons}>
            <FilterButton label={typeLabel} onPress={() => setTypePickerOpen(true)} />
            <FilterButton label={managerLabel} onPress={() => setManagerPickerOpen(true)} />
          </View>

          <View style={styles.viewToggle}>
            <Pressable
              onPress={() => setViewMode('grid')}
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.viewToggleButtonActive]}
            >
              <Ionicons name="grid-outline" size={16} color={viewMode === 'grid' ? colors.accentStrong : colors.textTertiary} />
            </Pressable>
            <Pressable
              onPress={() => setViewMode('list')}
              style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
            >
              <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? colors.accentStrong : colors.textTertiary} />
            </Pressable>
          </View>
        </View>

        {viewMode === 'grid' ? (
          <JobFolderGrid jobs={filteredJobs} heading={headingFor(statusFilter)} emptyMessage="No jobs match these filters" />
        ) : (
          <>
            <View style={styles.listHeaderRow}>
              <Text variant="title3">{headingFor(statusFilter)}</Text>
              <Text variant="footnote" color={colors.textTertiary}>
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </Text>
            </View>
            <JobsTable jobs={filteredJobs} />
          </>
        )}
      </View>

      <SelectModal
        visible={typePickerOpen}
        title="Filter by Project Type"
        options={[{ label: 'All Types', value: ALL_TYPES }, ...PROJECT_TYPES.map((t) => ({ label: t, value: t }))]}
        selectedValue={typeFilter}
        onSelect={(v) => setTypeFilter(v as ProjectType | typeof ALL_TYPES)}
        onClose={() => setTypePickerOpen(false)}
      />

      <SelectModal
        visible={managerPickerOpen}
        title="Filter by Manager"
        options={[
          { label: 'All Managers', value: ALL_MANAGERS },
          ...managers.map((m) => ({ label: m.name, value: m.id })),
        ]}
        selectedValue={managerFilter}
        onSelect={setManagerFilter}
        onClose={() => setManagerPickerOpen(false)}
      />
    </ScrollView>
  );
}

function FilterButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.filterButton}>
      <Text variant="subhead" color={colors.textPrimary} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={colors.textTertiary} style={styles.filterButtonIcon} />
    </Pressable>
  );
}

function headingFor(status: StatusFilter) {
  if (status === 'active') return 'Active Jobs';
  if (status === 'completed') return 'Completed Jobs';
  return 'All Job Folders';
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 1120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  newJobIcon: {
    marginRight: -2,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    maxWidth: 180,
  },
  filterButtonIcon: {
    marginLeft: spacing.xxs,
  },
  viewToggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  viewToggleButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.accentMuted,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});
