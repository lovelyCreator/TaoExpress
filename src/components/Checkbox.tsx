import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  uncheckedColor?: string;
  style?: object;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  size = 20,
  color = COLORS.accentPink,
  uncheckedColor = COLORS.gray[300],
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }, style]}
      onPress={onPress}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderColor: checked ? color : uncheckedColor,
            backgroundColor: checked ? color : 'transparent',
          },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={size * 0.7}
            color={COLORS.white}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Checkbox;