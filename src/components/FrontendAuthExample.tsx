import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuthMutations';
import { COLORS, FONTS, SPACING } from '../constants';

/**
 * Example component demonstrating the usage of frontend-only authentication
 * This component is for demonstration purposes only and is not part of the main application flow
 */
const FrontendAuthExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('man');

  // Using our custom login mutation hook
  const { 
    mutate: login, 
    isLoading: isLoginLoading, 
    isError: isLoginError, 
    error: loginError,
    isSuccess: isLoginSuccess
  } = useLoginMutation({
    onSuccess: (data) => {
      console.log('Login successful:', data);
      Alert.alert('Success', 'Login successful!');
    },
    onError: (error) => {
      console.log('Login error:', error);
      Alert.alert('Error', error);
    }
  });

  // Using our custom register mutation hook
  const { 
    mutate: register, 
    isLoading: isRegisterLoading, 
    isError: isRegisterError, 
    error: registerError,
    isSuccess: isRegisterSuccess
  } = useRegisterMutation({
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      Alert.alert('Success', 'Registration successful!');
    },
    onError: (error) => {
      console.log('Registration error:', error);
      Alert.alert('Error', error);
    }
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    login({ email, password });
  };

  const handleRegister = () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    register({ email, password, name, gender });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frontend Auth Example</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Name (for registration)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={isLoginLoading}
          >
            <Text style={styles.buttonText}>
              {isLoginLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={handleRegister}
            disabled={isRegisterLoading}
          >
            <Text style={styles.buttonText}>
              {isRegisterLoading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isLoginError && (
          <Text style={styles.errorText}>Login Error: {loginError}</Text>
        )}
        
        {isRegisterError && (
          <Text style={styles.errorText}>Register Error: {registerError}</Text>
        )}
        
        {isLoginSuccess && (
          <Text style={styles.successText}>Login Successful!</Text>
        )}
        
        {isRegisterSuccess && (
          <Text style={styles.successText}>Registration Successful!</Text>
        )}
      </View>
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
  form: {
    flex: 1,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
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

export default FrontendAuthExample;