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
import { AuthStackParamList } from '../../types';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../../hooks/useAuthMutations';
import { useToast } from '../../hooks/useToast';
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

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  
  const { showToast, ToastComponent } = useToast();

  const { mutate: verifyEmail, isLoading } = useVerifyEmailMutation({
    onSuccess: async () => {
      // Store the token if provided
      if (token) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('userToken', token);
        if (userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }
      }
      
      showToast({ message: 'Email verified successfully!', type: 'success' });
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as any }],
        });
      }, 1500);
    },
    onError: (error) => {
      showToast({ message: error, type: 'error' });
    },
  });

  const { mutate: resendCode } = useResendVerificationMutation({
    onSuccess: (data) => {
      showToast({ message: data.message || 'Verification code has been resent to your email', type: 'success' });
    },
    onError: (error) => {
      showToast({ message: error, type: 'error' });
    },
  });

  const handleVerify = async () => {
    if (value.length !== 6) {
      showToast({ message: 'Please enter the complete 6-digit code', type: 'error' });
      return;
    }

    await verifyEmail({ email, code: value });
  };

  const handleResendCode = async () => {
    await resendCode({ email });
  };

  return (
    <SafeAreaView style={styles.container}>
      {ToastComponent}
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
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6 digits OTP sent to your email at
        </Text>
        <Text style={styles.email}>{email}</Text>

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Resend</Text>
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
    marginBottom: SPACING.xl * 2,
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
  cellText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
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
