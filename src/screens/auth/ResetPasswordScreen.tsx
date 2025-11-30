import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '../../components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useResetPasswordMutation } from '../../hooks/useAuthMutations';
import { useToast } from '../../hooks/useToast';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showToast, ToastComponent } = useToast();
  
  const { mutate: resetPassword, isLoading } = useResetPasswordMutation({
    onSuccess: (data) => {
      showToast({ message: data.message || 'Password reset successfully!', type: 'success' });
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 1500);
    },
    onError: (error) => {
      showToast({ message: error, type: 'error' });
    },
  });
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    const { token, email } = (route.params as any) || {};
    
    if (!token || !email) {
      showToast({ message: 'Missing verification code or email', type: 'error' });
      return;
    }

    await resetPassword({
      email,
      code: token,
      password: formData.password,
    });
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {ToastComponent}
      <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TodayMall</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Please create a strong password with at least 8 characters.
            </Text>

            <TextInput
              label="New Password"
              placeholder="Enter your new password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              secureTextEntry={!showPassword}
              onToggleSecure={() => setShowPassword(!showPassword)}
              showSecureToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password}
              labelStyle={{ color: COLORS.black }}
            />

            <TextInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              secureTextEntry={!showConfirmPassword}
              onToggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
              showSecureToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.confirmPassword}
              labelStyle={{ color: COLORS.black }}
            />

            <TouchableOpacity
              style={
                (isLoading || !formData.password || !formData.confirmPassword)
                  ? { ...styles.resetButton, ...styles.resetButtonDisabled }
                  : styles.resetButton
              }
              onPress={handleResetPassword}
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  coadient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes['xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes['xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray['100'],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    // borderWidth: 1,
    // borderColor: COLORS.border,
    width: '100%' as const,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.smmd,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  resetButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%' as const,
  },
  resetButtonDisabled: {
    backgroundColor: COLORS.accentPinkLight,
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
  },
  helpLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
