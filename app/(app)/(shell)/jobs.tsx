import { ScrollView, StyleSheet, View } from 'react-native';

import { JOBS } from '../../../src/data/company';
import { JobFolderGrid } from '../../../src/features/jobs/JobFolderGrid';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { spacing } from '../../../src/theme';

export default function JobsScreen() {
  return (
    <RoleGate allow={['manager']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <JobFolderGrid jobs={JOBS} heading="All Job Folders" />
        </View>
      </ScrollView>
    </RoleGate>
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
