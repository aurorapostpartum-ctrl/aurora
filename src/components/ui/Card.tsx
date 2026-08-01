import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadows, type ShadowToken } from '../../theme';

export interface CardProps extends ViewProps {
  radiusToken?: keyof typeof radius;
  shadowToken?: ShadowToken;
  bordered?: boolean;
  surface?: 'default' | 'elevated' | 'paper';
}

export function Card({
  radiusToken = 'md',
  shadowToken = 'sm',
  bordered = true,
  surface = 'default',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        SURFACE_STYLE[surface],
        { borderRadius: radius[radiusToken] },
        shadows[shadowToken],
        bordered && { borderWidth: StyleSheet.hairlineWidth, borderColor: BORDER_COLOR[surface] },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const SURFACE_STYLE = {
  default: { backgroundColor: colors.surface },
  elevated: { backgroundColor: colors.backgroundElevated },
  paper: { backgroundColor: colors.paper },
} as const;

const BORDER_COLOR = {
  default: colors.surfaceBorder,
  elevated: colors.surfaceBorder,
  paper: colors.paperBorder,
} as const;

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
