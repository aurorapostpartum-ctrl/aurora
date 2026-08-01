import { StyleSheet, View } from 'react-native';

import { Chip, Text } from '../../../components/ui';
import { colors, spacing } from '../../../theme';
import { TRADES } from '../constants';
import type { StepProps } from './types';

export function TradesStep({ payload, updatePayload }: StepProps) {
  const toggleTrade = (id: string) => {
    const isSelected = payload.trades.includes(id);
    updatePayload({
      trades: isSelected ? payload.trades.filter((t) => t !== id) : [...payload.trades, id],
    });
  };

  return (
    <View>
      <Text variant="title2" style={styles.title}>
        What's your trade?
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Select all that apply. You can change this later.
      </Text>

      <View style={styles.grid}>
        {TRADES.map((trade) => (
          <Chip
            key={trade.id}
            label={trade.label}
            icon={trade.icon}
            selected={payload.trades.includes(trade.id)}
            onPress={() => toggleTrade(trade.id)}
          />
        ))}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
