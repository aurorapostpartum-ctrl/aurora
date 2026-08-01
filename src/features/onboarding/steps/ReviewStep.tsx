import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { GlassCard, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import { EMPLOYEE_RANGES, PROVINCES, SUBSCRIPTION_PLANS, TRADES } from '../constants';
import type { StepProps } from './types';

interface ReviewStepProps extends StepProps {
  onEditStep: (stepIndex: number) => void;
  formError: string | null;
}

export function ReviewStep({ payload, onEditStep, formError }: ReviewStepProps) {
  const provinceName = PROVINCES.find((p) => p.code === payload.province)?.name ?? '—';
  const tradeLabels = payload.trades
    .map((id) => TRADES.find((t) => t.id === id)?.label)
    .filter(Boolean)
    .join(', ');
  const employeeLabel =
    EMPLOYEE_RANGES.find((r) => r.id === payload.employeeCount)?.label ?? '—';
  const planName = SUBSCRIPTION_PLANS.find((p) => p.id === payload.subscriptionPlan)?.name ?? '—';

  return (
    <View>
      <Text variant="title2" style={styles.title}>
        Review & create
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Everything looks good? Let's set up your workspace.
      </Text>

      <GlassCard radiusToken="lg" style={styles.card}>
        <View style={styles.cardInner}>
          <View style={styles.companyRow}>
            {payload.logoUri ? (
              <Image source={{ uri: payload.logoUri }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business-outline" size={22} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.companyText}>
              <Text variant="headline" numberOfLines={1}>
                {payload.companyName || 'Your company'}
              </Text>
              <Text variant="footnote" color={colors.textSecondary}>
                {provinceName}
              </Text>
            </View>
          </View>

          <Divider />
          <ReviewRow
            label="Trade(s)"
            value={tradeLabels || 'None selected'}
            onEdit={() => onEditStep(1)}
          />
          <Divider />
          <ReviewRow label="Team size" value={employeeLabel} onEdit={() => onEditStep(2)} />
          <Divider />
          <ReviewRow
            label="Invited teammates"
            value={
              payload.inviteEmails.length > 0
                ? `${payload.inviteEmails.length} invited`
                : 'None yet'
            }
            onEdit={() => onEditStep(4)}
          />
          <Divider />
          <ReviewRow label="Plan" value={planName} onEdit={() => onEditStep(5)} />
        </View>
      </GlassCard>

      {formError ? (
        <View style={styles.errorWrap}>
          <Text variant="footnote" color={colors.danger}>
            {formError}
          </Text>
        </View>
      ) : null}

      <Text variant="caption1" color={colors.textTertiary} style={styles.terms}>
        By creating your company you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <Pressable onPress={onEdit} style={styles.row}>
      <View style={styles.rowText}>
        <Text variant="footnote" color={colors.textTertiary}>
          {label}
        </Text>
        <Text variant="subhead" numberOfLines={1} style={styles.rowValue}>
          {value}
        </Text>
      </View>
      <Text variant="footnote" color={colors.accent}>
        Edit
      </Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardInner: {
    padding: spacing.md,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowValue: {
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  errorWrap: {
    marginBottom: spacing.sm,
  },
  terms: {
    textAlign: 'center',
  },
});
