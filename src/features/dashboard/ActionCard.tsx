import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { GlassCard, Text } from '../../components/ui';
import type { ActionCardConfig } from './actionCards';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({
  config,
  onPress,
}: {
  config: ActionCardConfig;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: motion.duration.instant });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motion.duration.fast });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.pressable, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
    >
      <GlassCard radiusToken="md" style={styles.card}>
        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: `${config.tint}22` }]}>
            <Ionicons name={config.icon} size={20} color={config.tint} />
          </View>
          <Text variant="headline" numberOfLines={2} style={styles.title}>
            {config.title}
          </Text>
          <Text
            variant="footnote"
            color={colors.textSecondary}
            numberOfLines={2}
            style={styles.subtitle}
          >
            {config.subtitle}
          </Text>
        </View>
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  card: {
    flex: 1,
  },
  inner: {
    padding: spacing.md,
    minHeight: 130,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    lineHeight: 16,
  },
});
