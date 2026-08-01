import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '../../theme';

export interface ProgressBarProps {
  progress: number;
  trackColor?: string;
  fillColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  trackColor = colors.surfaceHighlight,
  fillColor = colors.accent,
  height = 6,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: radius.pill, backgroundColor: trackColor },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, borderRadius: radius.pill, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
