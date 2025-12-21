import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { useResendVerificationMutation } from '../../hooks/useAuthMutations';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

type OtpVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OtpVerification'
>;

type OtpVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OtpVerification'
>;

const CELL_COUNT = 6;

const OtpVerificationScreen: React.FC<{
  navigation: OtpVerificationScreenNavigationProp;
  route: OtpVerificationScreenRouteProp;
}> = ({ navigation, route }) => {
  const { email } = route.params || { email: '' };
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [resendEnabled, setResendEnabled] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to mask email (show only first letter before @)
  const maskEmail = (email: string) => {
    if (!email) return '***@gmail.com';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@gmail.com';
    return `${localPart.charAt(0)}***@${domain}`;
  };

  // Handle OTP value change
  const handleOtpChange = (text: string) => {
    setValue(text);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
      
      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    }
  };

  // Set error with Toast notification
  const setErrorWithTimeout = (errorMessage: string) => {
    setError(errorMessage);
    // showToast({ message: errorMessage, type: 'error' });
    
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    // Set new timeout to clear error after 30 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setError('');
      errorTimeoutRef.current = null;
    }, 30000); // 30 seconds
  };

  // Verify OTP
  const verifyOtp = () => {
    // Check if all fields are filled
    if (value.length !== CELL_COUNT) {
      setErrorWithTimeout(`Please enter all ${CELL_COUNT} digits of the OTP`);
      return;
    }
    
    // Navigate to reset password screen with email and code
    navigation.navigate('ResetPassword', { token: value, email: email });
  };

  // Resend OTP
  const { mutate: resendOtp } = useResendVerificationMutation({
    onSuccess: (data) => {
      // showToast({ message: data.message || 'A new OTP has been sent to your email.', type: 'success' });
      
      // Reset timer
      setTimeLeft(30);
      setResendEnabled(false);
      
      // Clear existing OTP
      setValue('');
      
      // Clear error message if present
      setError('');
      
      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    },
    onError: (error) => {
      // showToast({ message: error, type: 'error' });
    },
  });

  const handleResendOtp = () => {
    resendOtp({ email });
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !resendEnabled) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setResendEnabled(true);
    }
    
    return () => clearTimeout(timer);
  }, [timeLeft, resendEnabled]);

  // Cleanup effect for error timeout
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      
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
        <Text style={styles.title}>OTP</Text>
        <Text style={styles.subtitle}>
          Enter the {CELL_COUNT} digits OTP sent to your email at
        </Text>
        <Text style={styles.email}>{maskEmail(email)}</Text>
        
        {/* OTP Input Fields */}
        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={handleOtpChange}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({index, symbol, isFocused}) => (
            <View
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}>
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
        
        {/* Resend OTP Button */}
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleResendOtp}
          disabled={!resendEnabled}
        >
          <Text style={[styles.resendButtonText, !resendEnabled ? styles.resendButtonTextDisabled : null]}>
            {resendEnabled ? 'Resend OTP' : `Resend OTP in (${timeLeft} seconds)`}
          </Text>
        </TouchableOpacity>
        
        {/* Verify Button - Only show when all OTP digits are filled and no error */}
        {value.length === CELL_COUNT && !error && (
          <TouchableOpacity 
            style={
              value.length !== 6
                ? { ...styles.verifyButton, ...styles.verifyButtonDisabled }
                : styles.verifyButton
            }
            onPress={verifyOtp}
            disabled={value.length !== 6}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    borderRadius: BORDER_RADIUS.full,
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
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
    marginBottom: SPACING['xl'],
  },
  codeFieldRoot: {
    marginBottom: SPACING.lg,
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
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.red,
    marginLeft: 8,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resendButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.red,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#999999',
    textDecorationLine: 'none',
  },
  verifyButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    width: '100%',
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.redLight,
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default OtpVerificationScreen;