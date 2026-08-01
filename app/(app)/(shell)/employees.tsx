import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, StatusBadge, Table, Text } from '../../../src/components/ui';
import { PEOPLE } from '../../../src/data/company';
import { jobsForPerson } from '../../../src/data/selectors';
import { RoleGate } from '../../../src/navigation/RoleGate';
import { colors, spacing } from '../../../src/theme';
import type { Person } from '../../../src/types/domain';

export default function EmployeesScreen() {
  return (
    <RoleGate allow={['manager', 'employee']}>
      <EmployeesContent />
    </RoleGate>
  );
}

function EmployeesContent() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text variant="largeTitle">Employees</Text>
          <Text variant="footnote" color={colors.textTertiary}>
            {PEOPLE.length} people
          </Text>
        </View>

        <Table
          data={PEOPLE}
          keyExtractor={(p) => p.id}
          onRowPress={(p) => router.push(`/(app)/person/${p.id}`)}
          columns={[
            {
              key: 'name',
              label: 'Name',
              flex: 2,
              render: (p: Person) => (
                <View style={styles.nameCell}>
                  <Avatar initials={p.initials} color={p.avatarColor} size={28} />
                  <Text variant="subhead" style={styles.nameText} numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
              ),
            },
            {
              key: 'role',
              label: 'Role',
              render: (p: Person) => (
                <StatusBadge label={p.role === 'manager' ? 'Manager' : 'Employee'} tone={p.role === 'manager' ? 'accent' : 'neutral'} />
              ),
            },
            { key: 'title', label: 'Title', flex: 2, cellText: (p: Person) => p.title },
            {
              key: 'jobs',
              label: 'Jobs',
              flex: 2,
              cellText: (p: Person) => jobsForPerson(p).map((j) => j.name).join(', ') || '—',
            },
          ]}
        />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    marginLeft: spacing.sm,
  },
});
