import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../../theme';

export function StreamingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 420, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.cursor, style]} />;
}

const styles = StyleSheet.create({
  cursor: {
    width: 2,
    height: 15,
    marginLeft: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
});
