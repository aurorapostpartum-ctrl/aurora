import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { JOBS } from '../../../src/data/company';
import { JobFolderGrid } from '../../../src/features/jobs/JobFolderGrid';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { useAuth } from '../../../src/providers/AuthProvider';
import { spacing } from '../../../src/theme';

export default function MyJobsScreen() {
  return (
    <RoleGate allow={['employee']}>
      <MyJobsContent />
    </RoleGate>
  );
}

function MyJobsContent() {
  const { person } = useAuth();
  const myJobs = useMemo(() => (person ? JOBS.filter((j) => person.jobIds.includes(j.id)) : []), [person]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <JobFolderGrid jobs={myJobs} heading="My Jobs" emptyMessage="No jobs assigned yet" />
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
    maxWidth: 1040,
  },
});
