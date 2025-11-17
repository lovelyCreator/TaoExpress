import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useChangePasswordMutation } from '../../hooks/useAuthMutations';

type ChangePasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { mutate: changePassword, isLoading, isError, error, isSuccess } = useChangePasswordMutation({
    onSuccess: (data) => {
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

    // Check password complexity
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
      Alert.alert('Weak Password', 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    // Call the change password mutation
    changePassword({ currentPassword, newPassword });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Change Password</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    onToggleShow: () => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleShow}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPasswordRequirements = () => (
    <View style={styles.requirementsContainer}>
      <Text style={styles.requirementsTitle}>Password Requirements:</Text>
      <View style={styles.requirementsList}>
        <View style={styles.requirementItem}>
          <Ionicons
            name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={newPassword.length >= 8 ? COLORS.success : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: newPassword.length >= 8 ? COLORS.success : COLORS.gray[500] }
          ]}>
            At least 8 characters long
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[A-Z]/.test(newPassword) ? COLORS.success : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /[A-Z]/.test(newPassword) ? COLORS.success : COLORS.gray[500] }
          ]}>
            Contains uppercase letter
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[a-z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[a-z]/.test(newPassword) ? COLORS.success : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /[a-z]/.test(newPassword) ? COLORS.success : COLORS.gray[500] }
          ]}>
            Contains lowercase letter
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/\d/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/\d/.test(newPassword) ? COLORS.success : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /\d/.test(newPassword) ? COLORS.success : COLORS.gray[500] }
          ]}>
            Contains number
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? COLORS.success : COLORS.gray[400]}
          />
          <Text style={[
            styles.requirementText,
            { color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? COLORS.success : COLORS.gray[500] }
          ]}>
            Contains special character
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSecurityTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>Security Tips:</Text>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={styles.tipText}>Use a unique password that you don't use elsewhere</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="key" size={16} color={COLORS.primary} />
          <Text style={styles.tipText}>Consider using a password manager</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
          <Text style={styles.tipText}>Change your password regularly</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
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

          {newPassword.length > 0 && renderPasswordRequirements()}
          {renderSecurityTips()}
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.changeButton,
              (isLoading || isSuccess) && styles.changeButtonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={isLoading || isSuccess}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'Changing Password...' : isSuccess ? 'Password Changed!' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    marginTop: SPACING.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    paddingTop: SPACING.lg,
    marginBottom: 0,
  },
  formDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: SPACING.mdlg,
  },
  inputLabel: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
    height: 45,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  requirementsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  requirementsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  requirementsList: {
    gap: SPACING.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: FONTS.sizes.sm,
    marginLeft: SPACING.xs,
  },
  tipsContainer: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tipsList: {
    gap: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 18,
  },
  bottomContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingTop: 0,
  },
  changeButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  changeButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  changeButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'medium',
    color: COLORS.white,
  },
});

export default ChangePasswordScreen;