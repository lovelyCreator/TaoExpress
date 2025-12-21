import { TextStyle } from 'react-native';
import { FONTS } from '../constants';

/**
 * Helper function to add Noto Sans font family to text styles
 * Use this when creating StyleSheet styles for Text components
 * 
 * Usage:
 *   const styles = StyleSheet.create({
 *     title: withNotoSans({
 *       fontSize: FONTS.sizes.xl,
 *       fontWeight: '700',
 *     }),
 *   });
 */
export const withNotoSans = (style: TextStyle): TextStyle => {
  const fontWeight = style.fontWeight;
  return {
    ...style,
    fontFamily: FONTS.getFontFamily(fontWeight),
  };
};

/**
 * Creates a text style with Noto Sans font family
 * Automatically selects the correct font variant based on fontWeight
 */
export const createTextStyle = (style: TextStyle): TextStyle => {
  return withNotoSans(style);
};

/**
 * Helper to add fontFamily to all text styles in a StyleSheet
 * This can be used to bulk-update existing StyleSheets
 */
export const addFontFamilyToStyles = (styles: any): any => {
  const updatedStyles: any = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    if (style && typeof style === 'object') {
      updatedStyles[key] = {
        ...style,
        fontFamily: FONTS.getFontFamily(style.fontWeight),
      };
    } else {
      updatedStyles[key] = style;
    }
  });
  return updatedStyles;
};
