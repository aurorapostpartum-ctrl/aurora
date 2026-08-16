import { Platform } from 'react-native';

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

function shadow(offsetY: number, opacity: number, radius: number, elevation: number): ShadowStyle {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: Platform.OS === 'android' ? 0 : opacity,
    shadowRadius: radius,
    elevation,
  };
}

export const shadows = {
  none: shadow(0, 0, 0, 0),
  xs: shadow(2, 0.16, 6, 2),
  sm: shadow(4, 0.18, 10, 3),
  md: shadow(8, 0.2, 18, 5),
  lg: shadow(14, 0.24, 28, 8),
  xl: shadow(22, 0.28, 40, 12),
} as const;

export type ShadowToken = keyof typeof shadows;
