import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { GlassCard, Text } from '../../components/ui';
import { colors, spacing } from '../../theme';

export interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint?: string;
}

export function StatCard({ icon, label, value, tint = colors.accent }: StatCardProps) {
  return (
    <GlassCard style={styles.card} radiusToken="md">
      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: `${tint}26` }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text variant="title2" style={styles.value}>
          {value}
        </Text>
        <Text variant="caption1" color={colors.textSecondary}>
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  inner: {
    padding: spacing.md,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    marginBottom: 2,
  },
});
