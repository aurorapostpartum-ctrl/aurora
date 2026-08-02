import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme';

interface OrbProps {
  size: number;
  colorFrom: string;
  style: ViewStyle;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

function Orb({ size, colorFrom, style, duration, delay, driftX, driftY }: OrbProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(driftX, { duration, easing: ease }),
          withTiming(-driftX, { duration, easing: ease }),
          withTiming(0, { duration, easing: ease })
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-driftY, { duration: duration * 1.15, easing: ease }),
          withTiming(driftY, { duration: duration * 1.15, easing: ease }),
          withTiming(0, { duration: duration * 1.15, easing: ease })
        ),
        -1,
        false
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration * 0.8, easing: ease }),
          withTiming(0.94, { duration: duration * 0.8, easing: ease }),
          withTiming(1, { duration: duration * 0.8, easing: ease })
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        style,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[colorFrom, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

export function AnimatedBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.base} />
      <Orb
        size={420}
        colorFrom="rgba(47,111,237,0.26)"
        style={{ top: -160, left: -120 }}
        duration={9000}
        delay={0}
        driftX={26}
        driftY={32}
      />
      <Orb
        size={340}
        colorFrom="rgba(91,147,255,0.16)"
        style={{ bottom: -120, right: -100 }}
        duration={11000}
        delay={500}
        driftX={22}
        driftY={26}
      />
      <Orb
        size={280}
        colorFrom="rgba(47,111,237,0.12)"
        style={{ top: '38%', right: -130 }}
        duration={13000}
        delay={1000}
        driftX={18}
        driftY={20}
      />
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,8,8,0.35)',
  },
});
