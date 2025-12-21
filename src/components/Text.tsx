import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { FONTS } from '../constants';

interface TextProps extends RNTextProps {
  // Allow override of fontFamily if needed
  fontFamily?: string;
}

/**
 * Custom Text component that applies Noto Sans font by default
 * This component automatically applies the correct Noto Sans font variant
 * based on the fontWeight prop or style.
 * 
 * Usage:
 *   import { Text } from '../components';
 *   <Text style={styles.title}>Hello</Text>
 * 
 * Or use React Native's Text directly - it will use the default font from FONTS.defaultTextStyle
 */
const Text: React.FC<TextProps> = ({ style, fontFamily, fontWeight, ...props }) => {
  // Determine font family based on fontWeight if not explicitly provided
  const getFontFamily = (): string => {
    if (fontFamily) {
      return fontFamily;
    }

    // Check fontWeight prop first, then style
    const weight = fontWeight || (StyleSheet.flatten(style) as TextStyle)?.fontWeight;

    // Map fontWeight to appropriate Noto Sans variant
    if (weight === '700' || weight === '800' || weight === '900' || weight === 'bold') {
      return FONTS.families.bold;
    } else if (weight === '500' || weight === '600' || weight === 'medium' || weight === 'semibold') {
      return FONTS.families.medium;
    }

    // Default to regular
    return FONTS.families.regular;
  };

  return (
    <RNText
      style={[
        FONTS.defaultTextStyle,
        {
          fontFamily: getFontFamily(),
        },
        style,
      ]}
      {...props}
    />
  );
};

export default Text;
