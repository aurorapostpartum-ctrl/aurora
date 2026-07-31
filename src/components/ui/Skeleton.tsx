import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '../../theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radiusToken?: keyof typeof radius;
  style?: object;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radiusToken = 'sm',
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius[radiusToken] },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton width={40} height={40} radiusToken="pill" />
        <View style={styles.rowText}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} style={styles.spaceTop} />
        </View>
      </View>
      <Skeleton width="100%" height={12} style={styles.spaceTop} />
      <Skeleton width="80%" height={12} style={styles.spaceTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceHighlight,
  },
  card: {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  spaceTop: {
    marginTop: 8,
  },
});
