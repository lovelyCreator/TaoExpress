import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface FormInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  icon?: string;
  onIconPress?: () => void;
  error?: string;
  style?: object;
  inputStyle?: object;
  labelStyle?: object;
  errorStyle?: object;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  icon,
  onIconPress,
  error,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        
        {icon && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onIconPress}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={COLORS.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default FormInput;