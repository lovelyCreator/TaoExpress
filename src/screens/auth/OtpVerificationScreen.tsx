import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { COLORS, FONTS, SPACING } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
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

  // Set error with 30-second timeout
  const setErrorWithTimeout = (errorMessage: string) => {
    setError(errorMessage);
    
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
    
    // In a real app, you would validate this against your backend
    // For demo purposes, let's assume "111111" is valid
    if (value === '111111') {
      Alert.alert('Success', 'OTP verified successfully!');
      navigation.navigate('ResetPassword', { token: 'dummy-token' });
    } else {
      setErrorWithTimeout('The OTP you entered is incorrect. Please try again.');
    }
  };

  // Resend OTP
  const resendOtp = () => {
    // In a real app, you would call your API to resend OTP
    Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
    
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
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      
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
              style={[styles.otpInputContainer, isFocused && styles.focusCell, error ? styles.otpInputError : null]}>
              <Text style={styles.otpInput}>
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
          onPress={resendOtp}
          disabled={!resendEnabled}
        >
          <Text style={[styles.resendButtonText, !resendEnabled ? styles.resendButtonTextDisabled : null]}>
            {resendEnabled ? 'Resend OTP' : `Resend OTP in (${timeLeft} seconds)`}
          </Text>
        </TouchableOpacity>
        
        {/* Verify Button - Only show when all OTP digits are filled and no error */}
        {value.length === CELL_COUNT && !error && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={verifyOtp}
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
  backButton: {
    marginTop: SPACING['3xl'],
    marginLeft: SPACING.md,
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
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginBottom: 32,
  },
  codeFieldRoot: {
    marginBottom: 20,
  },
  focusCell: {
    borderColor: COLORS.black,
  },
  otpInputContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  otpInputError: {
    borderColor: '#FF3B30',
  },
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: '#FF3B30',
    marginLeft: 8,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#999999',
    textDecorationLine: 'none',
  },
  verifyButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default OtpVerificationScreen;