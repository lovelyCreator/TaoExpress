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
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, VALIDATION_RULES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword, isLoading } = useAuth();
  
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

    try {
      // Navigate to OTP verification screen with email parameter
      navigation.navigate('OtpVerification', { email });
      // await forgotPassword(email);
      // Alert.alert('Success', SUCCESS_MESSAGES.PASSWORD_RESET, [
      //   {
      //     text: 'OK',
      //     onPress: () => navigation.navigate('Login' as never),
      //   },
      // ]);
    } catch (error) {
      Alert.alert('Error', error as string);
    }
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
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray[400]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error && (
                <View style={styles.errorMessageContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Sending...' : 'Forgot Password'}
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
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  form: {
    flex: 1
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
    paddingBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
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
  resetButton: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
});

export default ForgotPasswordScreen;