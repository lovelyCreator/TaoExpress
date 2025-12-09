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
import GoogleIcon from '../../assets/icons/GoogleIcon';
import { Button, TextInput } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLoginMutation, useSocialLoginMutation, useResendVerificationMutation } from '../../hooks/useAuthMutations';
import { useToast } from '../../hooks/useToast';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
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
  const { loginError, clearLoginError, isGuest, setAuthenticatedUser, clearNavigateToProfile, setNavigateToProfile } = useAuth();
  const { showToast, ToastComponent } = useToast();
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
  
  const { mutate: login, isLoading, isError, error, isSuccess, data } = useLoginMutation({
    onSuccess: (data) => {
      // The AuthContext will handle updating the global state
      // This is just for side effects if needed
      console.log('LoginScreen: Login mutation success, updating AuthContext with data:', data);
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
        console.log('LoginScreen: Updating AuthContext with user data:', data.user);
        setAuthenticatedUser(user);
        // Set the flag to navigate to profile after login
        setNavigateToProfile();
      }
    },
    onError: (error, errorCode) => {
      // Handle specific error codes
      console.log('LoginScreen: Login mutation error:', error, 'Code:', errorCode);
      
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
      console.log('Social login successful:', data);
      
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
      
      console.log('LoginScreen: Social login successful, updating AuthContext');
      setAuthenticatedUser(user);
      setNavigateToProfile();
      
      // Navigate to main app
      navigation.navigate('Main' as never);
    },
    onError: (error) => {
      // Handle social login error
      console.log('Social login error:', error);
      showToast({ message: error, type: 'error' });
    }
  });

  // Resend verification code mutation
  const { mutate: resendCode } = useResendVerificationMutation({
    onSuccess: (data) => {
      showToast({ message: t('auth.verificationCodeSent'), type: 'success' });
      // Navigate to email verification screen
      (navigation as any).navigate('EmailVerification', {
        email: formData.email,
      });
    },
    onError: (error) => {
      showToast({ message: error || t('auth.failedToSendCode'), type: 'error' });
    },
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(true); // true means password is hidden (secureTextEntry=true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Watch for login success and navigate to profile
  useEffect(() => {
    console.log('LoginScreen: login success state changed - isSuccess:', isSuccess, 'data:', data);
    if (isSuccess && data) {
      // Navigate to main app 
      console.log('LoginScreen: Login successful, navigating to Main screen');
      // Use a more reliable approach to ensure the AuthContext is updated
      Promise.resolve().then(() => {
        navigation.navigate('Main' as never);
      });
    }
  }, [isSuccess, data, navigation]);

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
    console.log('LoginScreen: Email not verified, resending verification code');
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
    console.log('LoginScreen: Login function completed');
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

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'kakao') => {
    try {
      await socialLoginMutation(provider);
    } catch (error) {
      console.log('Social login error:', error);
      showToast({ message: error as string, type: 'error' });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleSignup = () => {
    console.log('LoginScreen: handleSignup called - navigating to Signup');
    navigation.navigate('Signup' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('LoginScreen: useFocusEffect - screen focused');
      
      const onBackPress = () => {
        if ((navigation as any).canGoBack && (navigation as any).canGoBack()) {
          (navigation as any).goBack();
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        console.log('LoginScreen: useFocusEffect - screen unfocused');
        sub.remove();
      };
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.container}>
      {ToastComponent}
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
            {/* <Image source={require("../../assets/icons/logo.png")} /> */}
            <Text style={styles.title}>TodayMall</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.subHeader}>
            <Text style={styles.subtitle}>{t('auth.signIn')}</Text>
            {/* <Text style={styles.subtitle}>Please login to continue</Text> */}
          </View>


          <View style={styles.form}>
            <TextInput
              label={t('auth.email')}
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
            />

            <TextInput
              label={t('auth.password')}
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
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>

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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('apple')}
                disabled={isSocialLoading}
              >
                <Ionicons name="logo-apple" size={24} color={COLORS.black} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
                disabled={isSocialLoading}
              >
                <GoogleIcon width={24} height={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('facebook')}
                disabled={isSocialLoading}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('twitter')}
                disabled={isSocialLoading}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('kakao')}
                disabled={isSocialLoading}
              >
                <View style={{ width: 24, height: 24, backgroundColor: '#FEE500', borderRadius: 4 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t('auth.dontHaveAccount')} </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>{t('auth.signUp')}</Text>
              </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  headerImage: {
    paddingVertical: SPACING['3xl'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subHeader: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
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
  form: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING['2xl'],
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
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.accentPinkLight,
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
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.lg,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  socialButtonGoogle: {
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.border,
  },
  socialButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
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
    color: COLORS.error,
    fontWeight: '700',
  },
});

export default LoginScreen;
