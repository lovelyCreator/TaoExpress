import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: string;
  disabled?: boolean;
  style?: object;
  textStyle?: object;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getDisabledStyle = () => {
    if (!disabled) return {};
    switch (variant) {
      case 'outline':
        return styles.disabledOutlineButton;
      default:
        return styles.disabledButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && getDisabledStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={20}
          color={variant === 'outline' ? COLORS.text.primary : COLORS.white}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.smmd,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
  },
  secondaryButton: {
    backgroundColor: COLORS.gray[100],
  },
  outlineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledOutlineButton: {
    backgroundColor: COLORS.gray[100],
    opacity: 0.5,
  },
  text: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.text.primary,
  },
  dangerText: {
    color: COLORS.white,
  },
  icon: {
    marginRight: SPACING.sm,
  },
});

export default ActionButton;