import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, SHADOWS } from '../constants';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  style?: object;
  iconStyle?: object;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  color = COLORS.text.primary,
  backgroundColor = COLORS.white,
  disabled = false,
  style,
  iconStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: size * 0.75,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon as any}
        size={size}
        color={disabled ? COLORS.gray[300] : color}
        style={iconStyle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;