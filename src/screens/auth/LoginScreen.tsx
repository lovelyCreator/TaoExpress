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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import { Button, TextInput } from '../../components';
// import { GoogleSignin, GoogleSigninButton, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLoginMutation } from '../../hooks/useAuthMutations';
import { useSocialLogin } from '../../services/socialAuth';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';

// GoogleSignin.configure({
//   webClientId: '329489503761-db8oqqkc3q63k3ilpigktbpr6tr1r7oe.apps.googleusercontent.com',
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
  const { socialLogin, loginError, clearLoginError, isGuest, setAuthenticatedUser, clearNavigateToProfile, setNavigateToProfile } = useAuth();
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
    onError: (error) => {
      // Error is handled by the hook and will be available in the error state
      console.log('LoginScreen: Login mutation error:', error);
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
      console.log('Social login error:', error);
      Alert.alert('Login Failed', error);
    }
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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

  // Watch for login errors and apply them to both fields for red borders
  // but only show error message below password field
  useEffect(() => {
    if (isError && error) {
      setErrors({ 
        email: 'login_error', // Special marker for red border only
        password: error // Actual error message for display
      });
    } else if (loginError) {
      setErrors({ 
        email: 'login_error', // Special marker for red border only
        password: loginError // Actual error message for display
      });
    } else if (isSocialError && socialError) {
      setErrors({ 
        email: 'login_error', // Special marker for red border only
        password: socialError // Actual error message for display
      });
    }
  }, [isError, error, loginError, isSocialError, socialError]);

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
      Alert.alert('Login Failed', error as string);
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
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Please login to continue</Text>
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
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              disabled={isLoading || !formData.email || !formData.password}
              loading={isLoading}
              variant="danger"
              style={styles.loginButton}
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
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Button
                title="Apple"
                onPress={() => handleSocialLogin('apple')}
                disabled={isSocialLoading}
                variant="outline"
                size="small"
                leftIcon="logo-apple"
                iconColor={COLORS.black}
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />

              <Button
                title="Google"
                onPress={() => handleSocialLogin('google')}
                disabled={isSocialLoading}
                variant="outline"
                size="small"
                leftElement={<GoogleIcon width={20} height={20} />}
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />

              <Button
                title="Facebook"
                onPress={() => handleSocialLogin('facebook')}
                disabled={isSocialLoading}
                variant="outline"
                size="small"
                leftIcon="logo-facebook"
                iconColor="#1877F2"
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />

              <Button
                title="Twitter"
                onPress={() => handleSocialLogin('twitter')}
                disabled={isSocialLoading}
                variant="outline"
                size="small"
                leftIcon="logo-twitter"
                iconColor="#1DA1F2"
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />

              <Button
                title="Kakao"
                onPress={() => handleSocialLogin('kakao')}
                disabled={isSocialLoading}
                variant="outline"
                size="small"
                leftElement={<View style={{ width: 20, height: 20, backgroundColor: '#FEE500', borderRadius: 4 }} />}
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles.signupLink}>Sign up</Text>
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
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
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
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes['2lgxl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  form: {
    flex: 1,
    marginHorizontal: SPACING.lg,
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
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONTS.sizes.sm,
    color: '#FE1583',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  loginButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: SPACING.lg,
  },
  signupText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: FONTS.sizes.sm,
    color: '#FE1583',
    fontWeight: '500',
  },
});

export default LoginScreen;
