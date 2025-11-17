import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  leftIcon?: string;
  rightIcon?: string;
  leftImage?: ImageSourcePropType;
  rightImage?: ImageSourcePropType;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  iconSize?: number;
  iconColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  activeOpacity = 0.8,
  leftIcon,
  rightIcon,
  leftImage,
  rightImage,
  leftElement,
  rightElement,
  iconSize = 20,
  iconColor,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
      },
      medium: {
        paddingVertical: SPACING.smmd,
        paddingHorizontal: SPACING.lg,
      },
      large: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: COLORS.black,
      },
      secondary: {
        backgroundColor: COLORS.gray[200],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      danger: {
        backgroundColor: COLORS.error,
      },
    };

    // Disabled style
    const disabledStyle: ViewStyle = disabled || loading ? {
      opacity: 0.5,
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '500',
    };

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      small: {
        fontSize: FONTS.sizes.sm,
      },
      medium: {
        fontSize: FONTS.sizes.base,
      },
      large: {
        fontSize: FONTS.sizes.lg,
      },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      primary: {
        color: COLORS.white,
      },
      secondary: {
        color: COLORS.text.primary,
      },
      outline: {
        color: COLORS.text.primary,
      },
      danger: {
        color: COLORS.white,
      },
    };

    return {
      ...baseStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (variant === 'primary' || variant === 'danger') return COLORS.white;
    return COLORS.text.primary;
  };

  const renderLeftContent = () => {
    if (leftElement) return leftElement;
    if (leftImage) {
      return (
        <Image 
          source={leftImage} 
          style={styles.iconImage} 
          resizeMode="contain"
        />
      );
    }
    if (leftIcon) {
      return (
        <Ionicons 
          name={leftIcon as any} 
          size={iconSize} 
          color={getIconColor()} 
        />
      );
    }
    return null;
  };

  const renderRightContent = () => {
    if (rightElement) return rightElement;
    if (rightImage) {
      return (
        <Image 
          source={rightImage} 
          style={styles.iconImage} 
          resizeMode="contain"
        />
      );
    }
    if (rightIcon) {
      return (
        <Ionicons 
          name={rightIcon as any} 
          size={iconSize} 
          color={getIconColor()} 
        />
      );
    }
    return null;
  };

  const leftContent = renderLeftContent();
  const rightContent = renderRightContent();

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? COLORS.white : COLORS.text.primary} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftContent && (
            <View style={styles.leftContent}>
              {leftContent}
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </View>
          {rightContent && (
            <View style={styles.rightContent}>
              {rightContent}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContent: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContent: {
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});

export default Button;
