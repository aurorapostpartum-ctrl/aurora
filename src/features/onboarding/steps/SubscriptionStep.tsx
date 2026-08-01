import { StyleSheet, View } from 'react-native';

import { PlanCard, Text } from '../../../components/ui';
import { colors, spacing } from '../../../theme';
import { SUBSCRIPTION_PLANS } from '../constants';
import type { StepProps } from './types';

export function SubscriptionStep({ payload, updatePayload }: StepProps) {
  return (
    <View>
      <Text variant="title2" style={styles.title}>
        Choose your plan
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Start with what fits today — upgrade anytime.
      </Text>

      {SUBSCRIPTION_PLANS.map((plan) => (
        <PlanCard
          key={plan.id}
          name={plan.name}
          price={plan.price}
          cadence={plan.cadence}
          tagline={plan.tagline}
          features={plan.features}
          highlighted={plan.highlighted}
          selected={payload.subscriptionPlan === plan.id}
          onPress={() => updatePayload({ subscriptionPlan: plan.id })}
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
