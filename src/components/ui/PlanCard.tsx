import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface PlanCardProps {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  selected: boolean;
  highlighted?: boolean;
  onPress: () => void;
}

export function PlanCard({
  name,
  price,
  cadence,
  tagline,
  features,
  selected,
  highlighted,
  onPress,
}: PlanCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: motion.duration.fast });
  }, [selected, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? colors.accent : colors.surfaceBorder,
    backgroundColor: progress.value > 0.5 ? colors.accentMuted : colors.surface,
  }));

  const radioStyle = useAnimatedStyle(() => ({
    borderColor: progress.value > 0.5 ? colors.accent : colors.surfaceBorder,
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Animated.View style={[styles.card, containerStyle]}>
        {highlighted ? (
          <View style={styles.badge}>
            <Text variant="caption2" color={colors.textOnAccent}>
              MOST POPULAR
            </Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="title3">{name}</Text>
            <Text variant="footnote" color={colors.textSecondary} style={styles.tagline}>
              {tagline}
            </Text>
          </View>
          <Animated.View style={[styles.radioOuter, radioStyle]}>
            {selected ? <View style={styles.radioInner} /> : null}
          </Animated.View>
        </View>

        <View style={styles.priceRow}>
          <Text variant="title1">{price}</Text>
          <Text variant="footnote" color={colors.textTertiary} style={styles.cadence}>
            {cadence}
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons name="checkmark" size={15} color={colors.accent} />
              <Text variant="subhead" color={colors.textSecondary} style={styles.featureLabel}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  tagline: {
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  cadence: {
    marginLeft: spacing.xxs,
  },
  features: {
    marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  featureLabel: {
    marginLeft: spacing.xs,
  },
});
