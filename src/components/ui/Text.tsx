import { forwardRef } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyToken } from '../../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: string;
}

export const Text = forwardRef<RNText, TextProps>(
  ({ variant = 'body', color = colors.textPrimary, style, ...rest }, ref) => {
    return (
      <RNText
        ref={ref}
        style={[typography[variant], { color }, style]}
        {...rest}
      />
    );
  }
);

Text.displayName = 'Text';
