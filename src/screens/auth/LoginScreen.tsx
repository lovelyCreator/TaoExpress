import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ArrowBackIcon from '../../assets/icons/ArrowBackIcon';
import ArrowDownIcon from '../../assets/icons/ArrowDownIcon';
import { Button, TextInput } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLoginMutation, useSocialLoginMutation, useResendVerificationMutation } from '../../hooks/useAuthMutations';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES, SCREEN_HEIGHT } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

// GoogleSignin.configure({
//   webClientId: '504835766110-ionim2k1keti3uhom9quotmifkimg42o.apps.googleusercontent.com',
// });

const LoginScreen: React.FC = () => {
  
  // const handleGoogleResponse = async () => { 
  //   try {
  //     console.log("Google Sign In");
  //     await GoogleSignin.hasPlayServices();
  //     const user = await GoogleSignin.signIn();
  //     console.log("Google User:", user);
  //     if (isSuccessResponse(user)) {
  //       // setData(user);
  //       // setIsSuccess(true);
  //       // options?.onSuccess?.(user);
  //       console.log("Success: ", user)
  //     }
  //   } catch (error) {
  //     if (isErrorWithCode(error)) {
  //       switch (error.code) {
  //         case "SIGN_IN_REQUIRED":
  //           console.log("User needs to sign in");
  //           break;
  //         case "PLAY_SERVICES_NOT_AVAILABLE":
  //           console.log("Play services are not available");
  //           break;
  //         default:
  //           console.log("Unknown error");
  //       }
  //     }
  //   }
  // };

  const navigation = useNavigation();
  const route = useRoute<any>();
  const returnTo = route.params?.returnTo;
  const returnParams = route.params?.returnParams;
  const { loginError, clearLoginError, isGuest, setAuthenticatedUser, clearNavigateToProfile, setNavigateToProfile } = useAuth();
  const { showToast } = useToast();
  const locale = useAppSelector((state) => state.i18n.locale) as 'en' | 'ko' | 'zh';
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  // Map language codes to flag emojis
  const getLanguageFlag = (locale: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
    };
    return flags[locale] || '🇺🇸';
  };
  
  const { mutate: login, isLoading, isError, error, isSuccess, data } = useLoginMutation({
    onSuccess: (data) => {
      // The AuthContext will handle updating the global state
      // This is just for side effects if needed
      // Update the AuthContext with the user data immediately
      if (data && data.user) {
        // Create a full User object from the partial data
        const user = {
          id: data.user.id || data.user.email || Date.now().toString(), // Use email or timestamp as ID
          email: data.user.email || '',
          name: data.user.name || data.user.email?.split('@')[0] || 'User', // Use email prefix or 'User' as name
          avatar: data.user.avatar || 'https://via.placeholder.com/150',
          phone: data.user.phone || '',
          addresses: data.user.addresses || [],
          paymentMethods: data.user.paymentMethods || [],
          wishlist: data.user.wishlist || [],
          followersCount: data.user.followersCount || 0, // Add followersCount
          followingsCount: data.user.followingsCount || 0, // Add followingsCount
          preferences: data.user.preferences || {
            notifications: {
              email: true,
              push: true,
              sms: true,
            },
            language: 'en',
            currency: 'USD',
          },
          createdAt: data.user.createdAt || new Date(),
          updatedAt: data.user.updatedAt || new Date(),
        };
        setAuthenticatedUser(user);
        // Set the flag to navigate to profile after login
        setNavigateToProfile();
      }
      showToast(t('auth.loginSuccess') || 'Login successful', 'success');
    },
    onError: (error, errorCode) => {
      // Handle specific error codes
      // Special handling for EMAIL_NOT_VERIFIED - resend code and navigate
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        // Resend verification code and navigate to verification screen
        handleEmailNotVerified();
        return;
      }
      
      let errorMessage = error;
      
      switch (errorCode) {
        case 'INVALID_CREDENTIALS':
          errorMessage = t('auth.invalidCredentials');
          break;
        case 'VALIDATION_ERROR':
          errorMessage = error || t('auth.checkInput');
          break;
        default:
          errorMessage = error || t('auth.loginFailed');
      }
      
      // Set error on password field (will show below password input)
      setErrors({ 
        email: 'login_error', // Special marker for red border only
        password: errorMessage // Actual error message for display
      });
    }
  });
  
  // Track which provider is being used for social login
  const { mutate: socialLoginMutation, isLoading: isSocialLoading, isError: isSocialError, error: socialError } = useSocialLoginMutation({
    onSuccess: async (data) => {
      // Handle successful social login - data already contains token, refreshToken, and user from backend
      // Update AuthContext with user data
      const user = {
        id: data.user.id || data.user.email || Date.now().toString(),
        email: data.user.email || '',
        name: data.user.name || data.user.email?.split('@')[0] || 'User',
        avatar: data.user.avatar || 'https://via.placeholder.com/150',
        phone: data.user.phone || '',
        addresses: data.user.addresses || [],
        paymentMethods: data.user.paymentMethods || [],
        wishlist: data.user.wishlist || [],
        followersCount: data.user.followersCount || 0,
        followingsCount: data.user.followingsCount || 0,
        preferences: data.user.preferences || {
          notifications: {
            email: true,
            push: true,
            sms: true,
          },
          language: 'en',
          currency: 'USD',
        },
        createdAt: data.user.createdAt || new Date(),
        updatedAt: data.user.updatedAt || new Date(),
      };
      
      setAuthenticatedUser(user);
      setNavigateToProfile();
      
      // If we have a returnTo param, navigate back to that screen
      if (returnTo) {
        Promise.resolve().then(() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            (navigation as any).navigate(returnTo, returnParams);
          }
        });
      } else {
        // Navigate to main app (default behavior)
        navigation.navigate('Main' as never);
      }
      showToast(t('auth.loginSuccess') || 'Login successful', 'success');
    },
    onError: (error) => {
      // Handle social login error
      showToast(error || t('auth.loginFailed') || 'Login failed', 'error');
    }
  });

  // Resend verification code mutation
  const { mutate: resendCode } = useResendVerificationMutation({
    onSuccess: (data) => {
      showToast(t('auth.verificationCodeSent') || 'Verification code sent', 'success');
      // Navigate to email verification screen
      (navigation as any).navigate('EmailVerification', {
        email: formData.email,
      });
    },
    onError: (error) => {
      showToast(error || t('auth.failedToSendCode') || 'Failed to send code', 'error');
    },
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(true); // true means password is hidden (secureTextEntry=true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Watch for login success and navigate accordingly
  useEffect(() => {
    if (isSuccess && data) {
      // If we have a returnTo param, navigate back to that screen
      if (returnTo) {
        Promise.resolve().then(() => {
          // Navigate back to the previous screen (ProductDetail)
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // Fallback: navigate to ProductDetail with params
            (navigation as any).navigate(returnTo, returnParams);
          }
        });
      } else {
        // Navigate to main app (default behavior)
        Promise.resolve().then(() => {
          navigation.navigate('Main' as never);
        });
      }
    }
  }, [isSuccess, data, navigation, returnTo, returnParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle email not verified case
  const handleEmailNotVerified = async () => {
    // Resend verification code
    await resendCode({ email: formData.email });
  };

  const handleLogin = async () => {
    // Always clear field errors and login errors first
    setErrors({});
    clearLoginError();

    const isValid = validateForm();
    if (!isValid) return;

    await login({ email: formData.email, password: formData.password });
  };

  // Demo login function
  const handleDemoLogin = async () => {
    // Clear any existing errors
    setErrors({});
    clearLoginError();
    
    // Use demo credentials
    const demoEmail = 'demo@example.com';
    const demoPassword = 'Demo123!';
    
    // Update form data to show demo credentials
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });
    
    // Perform login with demo credentials
    await login({ email: demoEmail, password: demoPassword });
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'kakao' | 'naver') => {
    try {
      if (provider === 'naver') {
        // TODO: Implement Naver social login when backend support is available
        return;
      }
      await socialLoginMutation(provider as 'google' | 'facebook' | 'apple' | 'twitter' | 'kakao');
    } catch (error) {
      // Social login error
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleSignup = () => {
    navigation.navigate('Signup' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
          (navigation as any).goBack();
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        sub.remove();
      };
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top half linear gradient background */}
      <LinearGradient
        colors={COLORS.gradients.authBackground}
        style={styles.gradientBackground}
      />

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
              <ArrowBackIcon width={12} height={20} color={COLORS.text.primary} />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => navigation.navigate('LanguageSettings' as never)}
              >
                <Text style={styles.flagText}>{getLanguageFlag(locale)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            {/* Toy illustration below logo and behind input fields */}
            <View style={styles.toyContainer}>
              {/* <View style={styles.toyShadow} /> */}
              <Image
                source={require('../../assets/icons/logo.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/icons/toy.png')}
                style={styles.toyImage}
                resizeMode="contain"
              />
              <Image
                source={require('../../assets/icons/shadow.png')}
                style={styles.shadowImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.formInputs}>
              <View style={styles.inputContainer}>
                <TextInput
                  // label={t('auth.email')}
                  placeholder={t('auth.enterEmail')}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                    if (loginError) {
                      clearLoginError();
                    }
                    if (isError) {
                      setErrors({ ...errors, email: '', password: '' });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  labelStyle={{ color: COLORS.black }}
                  roundedVariant="top"
                  wrapperStyle={styles.groupInputTop}
                  style={styles.input}
                />

                <TextInput
                  // label={t('auth.password')}
                  placeholder={t('auth.enterPassword')}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                    if (loginError) {
                      clearLoginError();
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
                  labelStyle={{ color: COLORS.black }}
                  roundedVariant="bottom"
                  wrapperStyle={styles.groupInputBottom}
                  style={styles.input}
                />
              </View>

              <Button
                title={t('auth.login')}
                onPress={handleLogin}
                disabled={isLoading || !formData.email || !formData.password}
                loading={isLoading}
                variant="danger"
                style={
                  (isLoading || !formData.email || !formData.password)
                    ? { ...styles.loginButton, ...styles.loginButtonDisabled }
                    : styles.loginButton
                }
                textStyle={styles.loginButtonText}
              />

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            </View>
            {/* Demo Login Button 
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoButtonText}>
                {isLoading ? 'Signing In...' : 'Demo Login'}
              </Text>
            </TouchableOpacity> */}
            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>

            <View style={styles.socialButtons}>
              {/* 1. Google */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
                disabled={isSocialLoading}
              >
                <Image
                  source={require('../../assets/icons/google.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>google</Text>
              </TouchableOpacity>

              {/* 2. Kakao */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('kakao')}
                disabled={isSocialLoading}
              >
                <Image
                  source={require('../../assets/icons/kakao.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>kakao</Text>
              </TouchableOpacity>

              {/* 3. Naver */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('naver')}
                disabled={isSocialLoading}
              >
                <Image
                  source={require('../../assets/icons/naver.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>naver</Text>
              </TouchableOpacity>

              {/* 4. Facebook */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('facebook')}
                disabled={isSocialLoading}
              >
                <Image
                  source={require('../../assets/icons/facebook.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>facebook</Text>
              </TouchableOpacity>

              {/* 5. Apple */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('apple')}
                disabled={isSocialLoading}
              >
                <Image
                  source={require('../../assets/icons/apple.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>apple</Text>
              </TouchableOpacity>
            </View>

            {/* Arrow down indicator below social icons */}
            <TouchableOpacity style={styles.arrowDownContainer} onPress={handleSignup}>
              <ArrowDownIcon width={24} height={24} color={COLORS.text.primary} />
            </TouchableOpacity>

            {/* <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t('auth.dontHaveAccount')} </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>{t('auth.signUp')}</Text>
              </TouchableOpacity>
            </View> */}

            {/* Footer bar */}
            <View style={styles.footerContainer}>
              {/* 1. Protection notice */}
              <View style={styles.footerRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#34A853" />
                <Text style={styles.footerProtectedText}>
                  {t('auth.infoProtected') || 'Your information is protected'}
                </Text>
              </View>

              {/* 2. Support text */}
              <Text style={styles.footerSupportText}>
                <Text style={styles.footerSupportGray}>
                  {t('auth.supportText') || 'Supports credit and check cards from various banks for recharging and payments. '}
                </Text>
                <Text style={styles.footerSupportLink}>
                  {t('auth.viewHelp') || 'View Help'}
                </Text>
              </Text>

              {/* 3. Copyright */}
              <Text style={styles.footerCopyright}>
                {t('auth.copyright') || '© 2025 TodayMall. All Rights Reserved.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT / 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.smmd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING['2xl'],
  },
  backButton: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  headerImage: {
    position: 'absolute',
    width: '75%',
    height: 210,
    top: 0,
  },
  subHeader: {
    paddingHorizontal: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.sizes['xl'],
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
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  flagText: {
    fontSize: 24,
  },
  toyContainer: {
    position: 'absolute',
    top: SPACING['2xl'], // just below logo area
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1, // send behind form inputs
  },
  toyShadow: {
    width: 180,
    height: 60,
    backgroundColor: '#FF550080',
    borderRadius: 30, // ellipse shape
    shadowColor: '#000',
    shadowOpacity: 0.5, // 50% shadow opacity
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toyImage: {
    marginTop: SPACING.sm,
    width: 140,
    height: 140,
  },
  shadowImage: {
    position: 'absolute',
    bottom: -95,
    width: 280,
    height: 200,
  },
  form: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: SPACING.xs,
  },
  formInputs: {
    marginTop: 180,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    paddingTop: SPACING['3xl'],
    backgroundColor: COLORS.background,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    backgroundColor: COLORS.gray[100],
  },
  groupInputTop: {
    position: 'absolute',
    bottom:-1,
    backgroundColor: COLORS.gray[100],
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  groupInputBottom: {
    backgroundColor: COLORS.gray[100],
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.red,
    marginBottom: SPACING.sm,
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
  forgotPassword: {
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    fontWeight: '400',
  },
  loginButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  loginButtonDisabled: {
    // backgroundColor: COLORS.lightRed,
    opacity: 0.6,
  },
  loginButtonText: {
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
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    fontWeight: '400',
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  socialButton: {
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 50,
    height: 50,
  },
  socialButtonGoogle: {
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.border,
  },
  socialButtonText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '400',
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
  },
  arrowDownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  footerContainer: {
    paddingTop: SPACING['xl'],
    // paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  footerProtectedText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.xs,
    color: '#34A853',
    fontWeight: '500',
    textAlign: 'center',
  },
  footerSupportText: {
    fontSize: FONTS.sizes.xs,
    lineHeight: FONTS.sizes.xs + 4,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  footerSupportGray: {
    color: COLORS.gray[500],
  },
  footerSupportLink: {
    color: '#327FE5',
    fontWeight: '500',
  },
  footerCopyright: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.black,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  signupText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: FONTS.sizes.md,
    color: COLORS.red,
    fontWeight: '700',
  },
});

export default LoginScreen;
