import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion, radius, spacing } from '../../theme';
import { Text } from '../../components/ui';
import type { ActionCardConfig } from './actionCards';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FeaturedCard({
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
    scale.value = withTiming(0.98, { duration: motion.duration.instant });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motion.duration.fast });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      <LinearGradient
        colors={['#2F80FF', '#7C5CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={config.icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.textBlock}>
          <Text variant="headline" color="#FFFFFF">
            {config.title}
          </Text>
          <Text variant="footnote" color="rgba(255,255,255,0.85)" style={styles.subtitle}>
            {config.subtitle}
          </Text>
        </View>
        <View style={styles.arrowWrap}>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    shadowColor: '#2F80FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  subtitle: {
    marginTop: 2,
  },
  arrowWrap: {
    marginLeft: spacing.sm,
  },
});
