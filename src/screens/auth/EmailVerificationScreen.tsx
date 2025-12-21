import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';
import { AuthStackParamList } from '../../types';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../hooks/useAuthMutations';
import { useAuth } from '../../context/AuthContext';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

type EmailVerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'EmailVerification'>;
type EmailVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'EmailVerification'>;

const CELL_COUNT = 6;

const EmailVerificationScreen = () => {
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const { email, token, userData } = route.params;
  const { setAuthenticatedUser, setNavigateToProfile } = useAuth();
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

  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  

  const { mutate: verifyEmail, isLoading } = useVerifyEmailMutation({
    onSuccess: async (data) => {
      // Clear any error messages
      setErrorMessage('');
      
      console.log('EmailVerificationScreen: Verification successful, data:', data);
      
      // The token and user data are already stored in the API call
      // Now update the AuthContext with the user data
      if (data && data.user) {
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
        
        console.log('EmailVerificationScreen: Updating AuthContext with user data:', user);
        
        // Update auth state - this will trigger the app to show as logged in
        setAuthenticatedUser(user);
        setNavigateToProfile();
        
        // Show success message
        // showToast({ message: t('auth.emailVerified'), type: 'success' });
        
        // Wait for state to update, then navigate
        // Use Promise.resolve to ensure state updates are processed
        await Promise.resolve();
        
        // Navigate to main screen after a short delay to show the success message
        setTimeout(() => {
          console.log('EmailVerificationScreen: Navigating to Main screen');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as any }],
          });
        }, 1500);
      } else {
        // If no user data, just show success and navigate
        // showToast({ message: 'Email verified successfully!', type: 'success' });
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as any }],
          });
        }, 1500);
      }
    },
    onError: (error, errorCode) => {
      // Handle specific error codes and show error below code field
      let errorMsg = error;
      
      switch (errorCode) {
        case 'INVALID_VERIFICATION_CODE':
          errorMsg = t('auth.invalidVerificationCode');
          break;
        case 'USER_NOT_FOUND':
          errorMsg = t('auth.userNotFound');
          break;
        case 'VERIFICATION_CODE_EXPIRED':
          errorMsg = t('auth.codeExpired');
          break;
        case 'VALIDATION_ERROR':
          errorMsg = t('auth.invalidCodeFormat');
          break;
        default:
          errorMsg = error || t('auth.verificationFailed');
      }
      
      setErrorMessage(errorMsg);
    },
  });

  const { mutate: resendCode } = useResendVerificationMutation({
    onSuccess: (data) => {
      // Clear error message on successful resend
      setErrorMessage('');
      // showToast({ message: data.message || t('auth.codeResent'), type: 'success' });
    },
    onError: (error) => {
      // showToast({ message: error, type: 'error' });
    },
  });

  const handleVerify = async () => {
    // Clear previous error
    setErrorMessage('');
    
    if (value.length !== 6) {
      setErrorMessage(t('auth.enterCompleteCode'));
      return;
    }

    await verifyEmail({ email, code: value });
  };

  const handleResendCode = async () => {
    await resendCode({ email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TodayMall</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.emailVerification')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.enterOtp')}
        </Text>
        <Text style={styles.email}>{email}</Text>

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            // Clear error when user starts typing
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              key={index}
              style={[
                styles.cell, 
                isFocused && styles.focusCell,
                errorMessage && styles.cellError
              ]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyButtonText}>{t('auth.verifyEmail')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>{t('auth.didntReceiveCode')} </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>{t('auth.resend')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[400],
    marginBottom: SPACING.sm,
  },
  email: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[400],
    marginBottom: SPACING.xl,
  },
  codeFieldRoot: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  cell: {
    width: 48,
    height: 56,
    lineHeight: 54,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    textAlign: 'center',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCell: {
    borderColor: COLORS.primary,
  },
  cellError: {
    borderColor: COLORS.error,
  },
  cellText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  errorIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    marginRight: SPACING.xs,
  },
  errorIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    flex: 1,
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;
