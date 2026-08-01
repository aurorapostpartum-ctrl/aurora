import { StyleSheet, View } from 'react-native';

import { SelectRow, Text } from '../../../components/ui';
import { colors, spacing } from '../../../theme';
import { EMPLOYEE_RANGES } from '../constants';
import type { StepProps } from './types';

export function TeamSizeStep({ payload, updatePayload }: StepProps) {
  return (
    <View>
      <Text variant="title2" style={styles.title}>
        How big is your team?
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        We'll set up seats and permissions to match.
      </Text>

      {EMPLOYEE_RANGES.map((range) => (
        <SelectRow
          key={range.id}
          title={range.label}
          subtitle={range.sublabel}
          selected={payload.employeeCount === range.id}
          onPress={() => updatePayload({ employeeCount: range.id })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
});
