import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '../../components';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useForgotPasswordMutation } from '../../hooks/useAuthMutations';
import { useToast } from '../../hooks/useToast';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, VALIDATION_RULES, ERROR_MESSAGES } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
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
  
  const { mutate: forgotPassword, isLoading } = useForgotPasswordMutation({
    onSuccess: (data) => {
      console.log('ForgotPassword: Success callback called');
      showToast({ message: data?.message || t('auth.resetCodeSent'), type: 'success' });
      setTimeout(() => {
        navigation.navigate('OtpVerification', { email });
      }, 1000);
    },
    onError: (error) => {
      console.log('ForgotPassword: Error callback called with:', error);
      showToast({ message: error || t('auth.failedToSendResetLink'), type: 'error' });
    },
  });
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return false;
    }
    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }
    setError('');
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateEmail()) return;

    await forgotPassword({ email });
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
      return () => sub.remove();
    }, [navigation])
  );

  const handleBackToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {ToastComponent}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>TodayMall</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <Text style={styles.subtitle}>{t('auth.forgotPasswordTitle')}</Text>
            {/* <Text style={styles.subtitle}>
              Enter your email to reset your password.
            </Text> */}

            <TextInput
              label={t('auth.email')}
              placeholder={t('auth.enterEmail')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
              labelStyle={{ color: COLORS.black }}
            />

            <TouchableOpacity
              style={
                (isLoading || !email)
                  ? { ...styles.resetButton, ...styles.resetButtonDisabled }
                  : styles.resetButton
              }
              onPress={handleForgotPassword}
              disabled={isLoading || !email}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING['2xl'],
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  placeholder: {
    width: 32,
  },
  form: {
    flex: 1
  },
  title: {
    fontSize: FONTS.sizes['xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },

  resetButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
});

export default ForgotPasswordScreen;