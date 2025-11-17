import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSocialLogin } from '../services/socialAuth';
import { COLORS, FONTS, SPACING } from '../constants';

/**
 * Example component demonstrating the usage of useSocialLogin hook
 * This component is for demonstration purposes only and is not part of the main application flow
 */
const SocialAuthExample: React.FC = () => {
  const { 
    mutate: socialLogin, 
    isLoading, 
    isError, 
    error,
    isSuccess,
    data
  } = useSocialLogin({
    onSuccess: (data) => {
      console.log('Social login successful:', data);
      Alert.alert('Success', `Welcome ${data.userInfo.name || 'User'}!`);
    },
    onError: (error) => {
      console.log('Social login error:', error);
      Alert.alert('Error', error);
    }
  });

  const handleGoogleLogin = () => {
    socialLogin('google');
  };

  const handleFacebookLogin = () => {
    socialLogin('facebook');
  };

  const handleAppleLogin = () => {
    socialLogin('apple');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Auth Example</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in with Google...' : 'Sign in with Google'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={handleFacebookLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in with Facebook...' : 'Sign in with Facebook'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleAppleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in with Apple...' : 'Sign in with Apple'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isError && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      
      {isSuccess && (
        <Text style={styles.successText}>Login Successful!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: SPACING.lg,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: FONTS.sizes.sm,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  successText: {
    color: COLORS.success,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default SocialAuthExample;