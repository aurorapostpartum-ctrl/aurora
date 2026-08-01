import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '../../../src/components/ui';
import { JOBS } from '../../../src/data/company';
import { useMockDataVersion } from '../../../src/data/mockStore';
import { JobFolderGrid } from '../../../src/features/jobs/JobFolderGrid';
import { NewJobModal } from '../../../src/features/jobs/NewJobModal';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, spacing } from '../../../src/theme';

export default function JobsScreen() {
  return (
    <RoleGate allow={['manager']}>
      <JobsContent />
    </RoleGate>
  );
}

function JobsContent() {
  useMockDataVersion();
  const [newJobOpen, setNewJobOpen] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text variant="largeTitle">Jobs</Text>
          <Button
            label="New Job"
            icon={<Ionicons name="add" size={18} color={colors.textOnAccent} style={styles.newJobIcon} />}
            fullWidth={false}
            onPress={() => setNewJobOpen(true)}
          />
        </View>
        <JobFolderGrid jobs={JOBS} heading="All Job Folders" />
      </View>

      <NewJobModal visible={newJobOpen} onClose={() => setNewJobOpen(false)} />
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
    maxWidth: 1040,
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
});
