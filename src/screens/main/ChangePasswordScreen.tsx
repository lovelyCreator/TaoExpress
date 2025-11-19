import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING } from '../../constants';
import { RootStackParamList } from '../../types';
import { useChangePasswordMutation } from '../../hooks/useAuthMutations';

type ChangePasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  
  const { mutate: changePassword, isLoading } = useChangePasswordMutation({
    onSuccess: () => {
      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              navigation.goBack();
            },
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error || 'Failed to change password. Please try again.');
    }
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Same Password', 'New password must be different from current password.');
      return;
    }

    changePassword({ currentPassword, newPassword });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Change Password</Text>
      <View style={styles.placeholder} />
    </LinearGradient>
  );

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    onToggleShow: () => void,
    placeholder: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          secureTextEntry={showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleShow}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPasswordRequirements = () => (
    <View style={styles.requirementsCard}>
      <Text style={styles.requirementsTitle}>Password Requirements:</Text>
      <View style={styles.requirementsList}>
        <View style={styles.requirementItem}>
          <Ionicons
            name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={newPassword.length >= 8 ? '#4CAF50' : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: newPassword.length >= 8 ? '#4CAF50' : COLORS.gray[500] }
          ]}>
            At least 8 characters
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={/[A-Z]/.test(newPassword) ? '#4CAF50' : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /[A-Z]/.test(newPassword) ? '#4CAF50' : COLORS.gray[500] }
          ]}>
            One uppercase letter
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[a-z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={/[a-z]/.test(newPassword) ? '#4CAF50' : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /[a-z]/.test(newPassword) ? '#4CAF50' : COLORS.gray[500] }
          ]}>
            One lowercase letter
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/\d/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={/\d/.test(newPassword) ? '#4CAF50' : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /\d/.test(newPassword) ? '#4CAF50' : COLORS.gray[500] }
          ]}>
            One number
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword),
            'Enter your current password'
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNewPassword,
            () => setShowNewPassword(!showNewPassword),
            'Enter your new password'
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword),
            'Confirm your new password'
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {newPassword.length > 0 && renderPasswordRequirements()}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
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
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: -20,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    padding: 0,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requirementsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requirementsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  requirementsList: {
    gap: SPACING.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
});

export default ChangePasswordScreen;
