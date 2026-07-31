import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: {
    instant: 120,
    fast: 180,
    base: 260,
    slow: 380,
    slower: 520,
  },
  easing: {
    standard: Easing.bezier(0.22, 1, 0.36, 1),
    decelerate: Easing.bezier(0.16, 1, 0.3, 1),
    accelerate: Easing.bezier(0.7, 0, 0.84, 0),
    spring: { damping: 18, stiffness: 220, mass: 0.9 },
    springSoft: { damping: 20, stiffness: 160, mass: 1 },
    springSnappy: { damping: 16, stiffness: 280, mass: 0.7 },
  },
} as const;
