import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius } from '../../theme';

export interface GlassCardProps extends ViewProps {
  intensity?: number;
  radiusToken?: keyof typeof radius;
  bordered?: boolean;
  elevated?: boolean;
}

export function GlassCard({
  intensity = 40,
  radiusToken = 'md',
  bordered = true,
  elevated = true,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const borderRadius = radius[radiusToken];

  return (
    <View
      style={[
        styles.wrapper,
        elevated && styles.shadow,
        { borderRadius },
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          StyleSheet.absoluteFill,
          { borderRadius },
        ]}
      />
      <View
        style={[
          styles.tint,
          bordered && styles.border,
          { borderRadius },
        ]}
      />
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: Platform.OS === 'web' ? 'hidden' : 'visible',
    backgroundColor: Platform.OS === 'android' ? colors.backgroundElevated : 'transparent',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
  },
  border: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
});
