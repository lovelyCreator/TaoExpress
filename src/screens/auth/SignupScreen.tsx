import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  BackHandler,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CheckIcon from '../../assets/icons/CheckIcon';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import { Button, TextInput } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useRegisterMutation } from '../../hooks/useAuthMutations';
import { useSocialLogin } from '../../services/socialAuth';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { socialLogin, signupError, clearSignupError } = useAuth();
  const { mutate: register, isLoading, isError, error, isSuccess, data } = useRegisterMutation({
    onSuccess: (data) => {
      // The AuthContext will handle updating the global state
      // This is just for side effects if needed
      console.log('User Registeration successful:', data);
      handleLogin();
    },
    onError: (error) => {
      // Error is handled by the hook and will be available in the error state
      console.log('User signup error:', error);
    }
  });
  
  const { mutate: socialLoginMutation, isLoading: isSocialLoading, isError: isSocialError, error: socialError } = useSocialLogin({
    onSuccess: (data) => {
      // Handle successful social login
      console.log('Social login successful:', data);
      // You would typically send this data to your backend to create/update user
      // For now, we'll just show an alert
      Alert.alert('Success', `Welcome ${data.userInfo.name || 'User'}!`);
    },
    onError: (error) => {
      // Handle social login error
      console.log('Social signup error:', error);
      Alert.alert('Signup Failed', error);
    }
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    referralCode: '',
    gender: 'woman',
  });
  const [showPassword, setShowPassword] = useState(true); // true means password is hidden
  const [showConfirmPassword, setShowConfirmPassword] = useState(true); // true means password is hidden
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasSignupError, setHasSignupError] = useState(false);
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Watch for signup success and navigate to profile
  useEffect(() => {
    if (isSuccess && data) {
      // Navigate to main app (which will show profile by default)
      // navigation.reset({
      //   index: 3,
      //   routes: [{ name: 'Main' as never }],
      // });
      navigation.navigate('Login' as never);
    }
  }, [isSuccess, data, navigation]);

  // Watch for signup errors and handle them appropriately
  useEffect(() => {
    if (isError && error) {
      console.log('SignupScreen: Signup error detected:', error);
      console.log('SignupScreen: Error useEffect call stack:', new Error().stack);
      setHasSignupError(true);
      
      // Check if it's an existing email error
      if (error.includes('Email already registered')) {
        setErrors({ 
          email: 'The email address you provided is already registered. Please use other email' // Custom message for existing email
        });
      } else {
        // For other signup errors, show on both fields
        setErrors({ 
          email: 'signup_error', // Special marker for red border only
          password: error // Actual error message for display
        });
      }
    } else if (signupError) {
      console.log('SignupScreen: Signup error detected:', signupError);
      console.log('SignupScreen: Error useEffect call stack:', new Error().stack);
      setHasSignupError(true);
      
      // Check if it's an existing email error
      if (signupError.includes('Email already registered')) {
        setErrors({ 
          email: 'The email address you provided is already registered. Please use other email' // Custom message for existing email
        });
      } else {
        // For other signup errors, show on both fields
        setErrors({ 
          email: 'signup_error', // Special marker for red border only
          password: signupError // Actual error message for display
        });
      }
    } else if (isSocialError && socialError) {
      setHasSignupError(true);
      setErrors({ 
        email: 'signup_error', // Special marker for red border only
        password: socialError // Actual error message for display
      });
    } else {
      setHasSignupError(false);
    }
  }, [isError, error, signupError, isSocialError, socialError]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = 'Your password must be at least 8 characters long and include special characters.';
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      newErrors.password = 'Your password must be at least 8 characters long and include special characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    console.log('SignupScreen: handleSignup called');
    // Always clear field errors and signup errors first
    setErrors({});
    setHasSignupError(false);
    clearSignupError();

    const isValid = validateForm();
    if (!isValid) {
      console.log('SignupScreen: Form validation failed');
      return;
    }

    console.log('SignupScreen: Calling signup function');
    await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      gender: formData.gender,
    });
    console.log('SignupScreen: Signup function completed');
  };

  // Demo signup function
  const handleDemoSignup = async () => {
    // Clear any existing errors
    setErrors({});
    setHasSignupError(false);
    clearSignupError();
    
    // Use demo credentials
    const demoData = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'Demo123!',
      gender: 'woman',
    };
    
    // Update form data to show demo credentials
    setFormData(demoData);
    
    // Perform signup with demo credentials
    await register({
      email: demoData.email,
      password: demoData.password,
      name: demoData.name,
      gender: demoData.gender,
    });
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await socialLoginMutation(provider);
    } catch (error) {
      console.log('Social signup error:', error);
      Alert.alert('Signup Failed', error as string);
    }
  };

  const handleLogin = () => {
    console.log('SignupScreen: handleLogin called - navigating to Login');
    console.log('SignupScreen: handleLogin call stack:', new Error().stack);
    // Clear any signup errors before navigating to login
    clearSignupError();
    navigation.navigate('Login' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('SignupScreen: useFocusEffect - screen focused');
      console.log('SignupScreen: Current signupError when focused:', signupError);
      console.log('SignupScreen: Current hasSignupError when focused:', hasSignupError);
      
      const onBackPress = () => {
        console.log('SignupScreen: Back button pressed');
        if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
          (navigation as any).goBack();
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        console.log('SignupScreen: useFocusEffect - screen unfocused');
        console.log('SignupScreen: Current signupError when unfocused:', signupError);
        console.log('SignupScreen: Current hasSignupError when unfocused:', hasSignupError);
        sub.remove();
      };
    }, [navigation, signupError, hasSignupError])
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Image source={require("../../assets/icons/logo.png")} />
            <View style={styles.placeholder} />
          </View>
          <View style={styles.subHeader}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Please register to continue</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
                if (signupError) {
                  clearSignupError();
                  setHasSignupError(false);
                }
                if (isError) {
                  setErrors({ ...errors, email: '', password: '' });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              labelStyle={styles.signupLabel}
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
                if (signupError) {
                  clearSignupError();
                  setHasSignupError(false);
                }
                if (isError) {
                  setErrors({ ...errors, email: '', password: '' });
                }
              }}
              secureTextEntry={showPassword}
              onToggleSecure={() => setShowPassword(!showPassword)}
              showSecureToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.password}
              labelStyle={styles.signupLabel}
            />

            <TextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              secureTextEntry={showConfirmPassword}
              onToggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
              showSecureToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.confirmPassword}
              labelStyle={styles.signupLabel}
            />

            <TextInput
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
                if (signupError) {
                  clearSignupError();
                  setHasSignupError(false);
                }
                if (isError) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              autoCapitalize="words"
              autoCorrect={false}
              error={errors.name}
              labelStyle={styles.signupLabel}
            />

            <TextInput
              label="Referral Code (Optional)"
              placeholder="Enter referral code"
              value={formData.referralCode}
              onChangeText={(text) => {
                setFormData({ ...formData, referralCode: text });
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              labelStyle={styles.signupLabel}
            />

            {/* Gender selection - hidden for now */}
            {/* <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderOption, formData.gender === 'woman' && styles.genderSelected]}
                  onPress={() => setFormData({ ...formData, gender: 'woman' })}
                >
                  <View style={[styles.radioButton, formData.gender === 'woman' && styles.radioSelected]}>
                    {formData.gender === 'woman' && (
                      <CheckIcon size={14} color={COLORS.white} stroke={3} />
                    )}
                  </View>
                  <Text style={[styles.genderText, formData.gender === 'woman' && styles.genderTextSelected]}>Woman</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.genderOption, formData.gender === 'man' && styles.genderSelected]}
                  onPress={() => setFormData({ ...formData, gender: 'man' })}
                >
                  <View style={[styles.radioButton, formData.gender === 'man' && styles.radioSelected]}>
                    {formData.gender === 'man' && (
                      <CheckIcon size={14} color={COLORS.white} stroke={3} />
                    )}
                  </View>
                  <Text style={[styles.genderText, formData.gender === 'man' && styles.genderTextSelected]}>Man</Text>
                </TouchableOpacity>
              </View>
            </View> */}

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsBusinessAccount(!isBusinessAccount)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isBusinessAccount && styles.checkboxChecked]}>
                  {isBusinessAccount && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.checkboxText}>Register as Business Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the{' '}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Register"
              onPress={handleSignup}
              disabled={isLoading || !formData.email || !formData.password || !formData.confirmPassword || !formData.name || !agreeToTerms}
              loading={isLoading}
              variant="danger"
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... existing styles ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  subHeader: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  form: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.accentPink,
    marginBottom: SPACING.sm,
  },
  signupLabel: {
    color: COLORS.accentPink,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: '#FF6B9D',
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  alarmMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  alarmText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    justifyContent: 'space-between',
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
    width: '50%',
  },
  genderSelected: {
    // Add any selected state styling if needed
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.black,
  },
  radioInner: {
    width: 0,
    height: 0,
  },
  genderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  genderTextSelected: {
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  checkboxContainer: {
    marginBottom: SPACING.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  checkboxText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  linkText: {
    color: '#FE1583',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  registerButtonText: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  demoButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  demoButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.custom,
    marginHorizontal: SPACING.sm,
  },
  socialButtons: {
    marginHorizontal: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonGoogle: {
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.border,
  },
  socialButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loginText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    fontWeight: '700',
  },
});

export default SignupScreen;