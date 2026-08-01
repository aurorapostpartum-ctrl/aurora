import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, motion, radius, spacing } from '../../theme';
import { Text } from './Text';

interface SegmentProps {
  index: number;
  progress: SharedValue<number>;
}

function Segment({ index, progress }: SegmentProps) {
  const fillStyle = useAnimatedStyle(() => {
    const fill = Math.min(Math.max(progress.value - index, 0), 1);
    return { width: `${fill * 100}%` };
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

export interface ProgressStepsProps {
  total: number;
  current: number;
  stepTitle?: string;
}

export function ProgressSteps({ total, current, stepTitle }: ProgressStepsProps) {
  const progress = useSharedValue(current);

  useEffect(() => {
    progress.value = withTiming(current + 1, {
      duration: motion.duration.slow,
      easing: motion.easing.standard,
    });
  }, [current, progress]);

  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length: total }).map((_, i) => (
          <Segment key={i} index={i} progress={progress} />
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text variant="caption1" color={colors.textTertiary}>
          STEP {current + 1} OF {total}
        </Text>
        {stepTitle ? (
          <Text variant="caption1" color={colors.textSecondary}>
            {stepTitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
