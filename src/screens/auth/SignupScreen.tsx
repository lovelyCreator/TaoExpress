import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRegisterMutation } from '../../hooks/useAuthMutations';
import { useSocialLogin } from '../../services/socialAuth';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { socialLogin, signupError, clearSignupError } = useAuth();
  const locale = useAppSelector((state) => state.i18n.locale) as 'en' | 'ko' | 'zh';
  const { showToast } = useToast();
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  const { mutate: register, isLoading, isError, error, isSuccess, data } = useRegisterMutation({
    onSuccess: (data) => {
      // The AuthContext will handle updating the global state
      // This is just for side effects if needed
      // console.log('User Registeration successful:', data);
      showToast(t('auth.signupSuccess') || 'Signup successful', 'success');
      handleLogin();
    },
    onError: (errorMessage, errorCode) => {
      // Handle specific error codes
      // console.log('User signup error:', errorMessage, 'Code:', errorCode);
      
      if (errorCode === 'EMAIL_ALREADY_REGISTERED') {
        // Show error only on email field
        setErrors({ 
          email: t('auth.emailAlreadyRegistered')
        });
        showToast(t('auth.emailAlreadyRegistered') || 'Email already registered', 'error');
      } else if (errorCode === 'INVALID_REFERRAL_CODE') {
        // Show error only on referral code field
        setErrors({ 
          referralCode: t('auth.invalidReferralCode')
        });
        showToast(t('auth.invalidReferralCode') || 'Invalid referral code', 'error');
      } else if (errorCode === 'VALIDATION_ERROR') {
        // Show validation error
        setErrors({ 
          email: errorMessage
        });
        showToast(errorMessage || 'Validation error', 'error');
      } else {
        // Show generic error
        showToast(errorMessage || t('auth.signupFailed') || 'Signup failed', 'error');
      }
    }
  });
  
  const { mutate: socialLoginMutation, isLoading: isSocialLoading, isError: isSocialError, error: socialError } = useSocialLogin({
    onSuccess: (data) => {
      // Handle successful social login
      // console.log('Social login successful:', data);
      // showToast({ message: `Welcome ${data.userInfo.name || 'User'}!`, type: 'success' });
    },
    onError: (error) => {
      // Handle social login error
      // console.log('Social signup error:', error);
      // showToast({ message: error, type: 'error' });
    }
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    referralCode: '',
    gender: 'woman',
  });
  const [showPassword, setShowPassword] = useState(true); // true means password is hidden
  const [showConfirmPassword, setShowConfirmPassword] = useState(true); // true means password is hidden
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasSignupError, setHasSignupError] = useState(false);
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Watch for signup success and navigate to email verification
  useEffect(() => {
    if (isSuccess && data) {
      if (data.requiresVerification) {
        // Registration successful, navigate to email verification
        (navigation as any).navigate('EmailVerification', {
          email: data.email || formData.email,
          message: data.message,
        });
      } else if (data.user && data.token) {
        // Registration successful with immediate login (old flow)
        (navigation as any).navigate('EmailVerification', {
          email: data.user.email || formData.email,
          token: data.token,
          userData: data.user,
        });
      }
    }
  }, [isSuccess, data, navigation, formData.email]);

  // Error handling is now done in the onError callback of useRegisterMutation
  // No need for this useEffect anymore

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      newErrors.name = t('auth.nameTooShort');
    }

    if (!formData.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Phone number is optional
    // if (!formData.phone) {
    //   newErrors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
    // } else if (formData.phone.length < 10) {
    //   newErrors.phone = 'Phone number must be at least 10 digits';
    // }

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = t('auth.passwordTooShort');
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    // console.log('SignupScreen: handleSignup called');
    // Always clear field errors and signup errors first
    setErrors({});
    setHasSignupError(false);
    clearSignupError();

    const isValid = validateForm();
    if (!isValid) {
      // console.log('SignupScreen: Form validation failed');
      return;
    }

    // console.log('SignupScreen: Calling signup function with data:', {
    //   email: formData.email,
    //   name: formData.name,
    //   phone: formData.phone || '',
    //   isBusiness: isBusinessAccount,
    //   referralCode: formData.referralCode || '',
    // });
    await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || '', // Optional phone number
      isBusiness: isBusinessAccount,
      referralCode: formData.referralCode || undefined, // Optional referral code
    });
    // console.log('SignupScreen: Signup function completed');
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
      confirmPassword: 'Demo123!',
      referralCode: '',
      gender: 'woman',
    };
    
    // Update form data to show demo credentials
    // setFormData(demoData);
    
    // // Perform signup with demo credentials
    // await register({
    //   email: demoData.email,
    //   password: demoData.password,
    //   name: demoData.name,
    //   gender: demoData.gender,
    // });
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await socialLoginMutation(provider);
    } catch (error) {
      // console.log('Social signup error:', error);
      // showToast({ message: error as string, type: 'error' });
    }
  };

  const handleLogin = () => {
    // console.log('SignupScreen: handleLogin called - navigating to Login');
    // console.log('SignupScreen: handleLogin call stack:', new Error().stack);
    // Clear any signup errors before navigating to login
    clearSignupError();
    navigation.navigate('Login' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      // console.log('SignupScreen: useFocusEffect - screen focused');
      // console.log('SignupScreen: Current signupError when focused:', signupError);
      // console.log('SignupScreen: Current hasSignupError when focused:', hasSignupError);
      
      const onBackPress = () => {
        // console.log('SignupScreen: Back button pressed');
        if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
          (navigation as any).goBack();
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        // console.log('SignupScreen: useFocusEffect - screen unfocused');
        // console.log('SignupScreen: Current signupError when unfocused:', signupError);
        // console.log('SignupScreen: Current hasSignupError when unfocused:', hasSignupError);
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>TodayMall</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.subHeader}>
            <Text style={styles.subtitle}>{t('auth.signup')}</Text>
            {/* <Text style={styles.subtitle}>Please register to continue</Text> */}
          </View>

          <View style={styles.form}>
            <TextInput
              label={`${t('auth.name')} *`}
              placeholder={t('auth.enterName')}
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
              }}
              autoCapitalize="words"
              autoCorrect={false}
              error={errors.name}
              labelStyle={styles.signupLabel}
            />

            <TextInput
              label={`${t('auth.email')} *`}
              placeholder={t('auth.enterEmail')}
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

            {/* Phone Number field hidden - optional value */}
            {/* <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => {
                setFormData({ ...formData, phone: text });
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
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
            />*/}

            <TextInput
              label={`${t('auth.password')} *`}
              placeholder={t('auth.enterPassword')}
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
              label={`${t('auth.confirmPassword')} *`}
              placeholder={t('auth.reEnterPassword')}
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
              label={t('auth.referralCode')}
              placeholder={t('auth.enterReferralCode')}
              value={formData.referralCode}
              onChangeText={(text) => {
                setFormData({ ...formData, referralCode: text });
                if (errors.referralCode) {
                  setErrors({ ...errors, referralCode: '' });
                }
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              error={errors.referralCode}
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
                <Text style={styles.checkboxText}>{t('auth.registerAsBusinessAccount')}</Text>
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
                  {t('auth.agreeToTerms')}{' '}
                  <Text style={styles.linkText}>{t('auth.termsOfService')}</Text>
                  {' '}{t('auth.and')}{' '}
                  <Text style={styles.linkText}>{t('auth.privacyPolicy')}</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={t('auth.register')}
              onPress={handleSignup}
              disabled={isLoading || !formData.email || !formData.password || !formData.confirmPassword || !formData.name || !agreeToTerms}
              loading={isLoading}
              variant="danger"
              style={
                (isLoading || !formData.email || !formData.password || !formData.confirmPassword || !formData.name || !agreeToTerms)
                  ? { ...styles.registerButton, ...styles.registerButtonDisabled }
                  : styles.registerButton
              }
              textStyle={styles.registerButtonText}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>{t('auth.logIn')}</Text>
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
    paddingHorizontal: SPACING.lg,
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
  subHeader: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  form: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING['3xl']
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.red,
    marginBottom: SPACING.sm,
  },
  signupLabel: {
    color: COLORS.black,
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
    color: COLORS.red,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.lightRed,
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: FONTS.sizes.lg,
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