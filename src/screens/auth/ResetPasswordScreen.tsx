import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, VALIDATION_RULES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetPassword, isLoading } = useAuth();
  
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

    try {
      const token = (route.params as any)?.token || 'mock_token';
      // await resetPassword(token, formData.password);
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
      ]);
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
            </TouchableOpacity>
            
            {/* <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>G</Text>
              </View>
              <Text style={styles.appName}>Glowmify</Text>
            </View> */}
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Please create a strong password with at least 8 characters.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                {/* <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} /> */}
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new password"
                  placeholderTextColor={COLORS.gray[400]}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.gray[400]}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                {/* <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray[400]} /> */}
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your new password"
                  placeholderTextColor={COLORS.gray[400]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' });
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.gray[400]}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View
                style={styles.buttonGradient}
              >
                <Text style={styles.resetButtonText}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Remember your password?{' '}
                <Text style={styles.helpLink} onPress={handleBackToLogin}>
                  Sign In
                </Text>
              </Text>
            </View> */}
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: 50,
    // paddingBottom: SPACING.xl,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  appName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: SPACING['2xl'],
  },
  title: {
    fontSize: FONTS.sizes['2xl'],
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
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    width: '100%' as const,
  },
  buttonGradient: {
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
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
