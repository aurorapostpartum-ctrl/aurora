import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme';

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  glow?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  glow = true,
  style,
  contentStyle,
}: ScreenProps) {
  return (
    <View style={[styles.root, style]}>
      {glow ? (
        <View pointerEvents="none" style={styles.glowWrap}>
          <LinearGradient
            colors={['rgba(47,128,255,0.16)', 'rgba(47,128,255,0)']}
            style={styles.glow}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      ) : null}
      <SafeAreaView edges={edges} style={[styles.safeArea, contentStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    overflow: 'hidden',
  },
  glow: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
});
