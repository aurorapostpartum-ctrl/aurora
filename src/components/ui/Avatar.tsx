import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../theme';
import { Text } from './Text';

export interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ initials, color = colors.accent, size = 32, style }: AvatarProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    >
      <Text
        variant={size <= 28 ? 'caption1' : 'footnote'}
        color={colors.textOnAccent}
        style={styles.label}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
