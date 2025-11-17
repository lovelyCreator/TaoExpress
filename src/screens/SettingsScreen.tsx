import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would delete the account
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const settingsSections: SettingItem[][] = [
    [
      {
        id: 'profile',
        title: 'Edit Profile',
        subtitle: 'Update your personal information',
        icon: 'person-outline',
        type: 'navigation',
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        id: 'addresses',
        title: 'Address Book',
        subtitle: 'Manage your delivery addresses',
        icon: 'location-outline',
        type: 'navigation',
        onPress: () => navigation.navigate('AddressBook' as never),
      },
      {
        id: 'payment',
        title: 'Payment Methods',
        subtitle: 'Manage your payment options',
        icon: 'card-outline',
        type: 'navigation',
        onPress: () => navigation.navigate('PaymentMethods'),
      },
    ],
    [
      {
        id: 'notifications',
        title: 'Push Notifications',
        subtitle: 'Receive notifications on your device',
        icon: 'notifications-outline',
        type: 'toggle',
        value: pushNotifications,
        onPress: () => setPushNotifications(!pushNotifications),
      },
      {
        id: 'email',
        title: 'Email Updates',
        subtitle: 'Receive updates via email',
        icon: 'mail-outline',
        type: 'toggle',
        value: emailUpdates,
        onPress: () => setEmailUpdates(!emailUpdates),
      },
      {
        id: 'location',
        title: 'Location Services',
        subtitle: 'Allow location access for better recommendations',
        icon: 'location-outline',
        type: 'toggle',
        value: locationServices,
        onPress: () => setLocationServices(!locationServices),
      },
    ],
    [
      {
        id: 'language',
        title: 'Language',
        subtitle: 'English',
        icon: 'language-outline',
        type: 'navigation',
        onPress: () => Alert.alert('Language', 'Language selection coming soon!'),
      },
      {
        id: 'currency',
        title: 'Currency',
        subtitle: 'USD ($)',
        icon: 'cash-outline',
        type: 'navigation',
        onPress: () => Alert.alert('Currency', 'Currency selection coming soon!'),
      },
      {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: 'shield-outline',
        type: 'navigation',
        onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon!'),
      },
      {
        id: 'terms',
        title: 'Terms of Service',
        icon: 'document-text-outline',
        type: 'navigation',
        onPress: () => Alert.alert('Terms of Service', 'Terms of service coming soon!'),
      },
    ],
    [
      {
        id: 'help',
        title: 'Help & Support',
        icon: 'help-circle-outline',
        type: 'navigation',
        onPress: () => Alert.alert('Help & Support', 'Help center coming soon!'),
      },
      {
        id: 'about',
        title: 'About Glowmify',
        subtitle: 'Version 1.0.0',
        icon: 'information-circle-outline',
        type: 'navigation',
        onPress: () => Alert.alert('About', 'Glowmify v1.0.0\nYour favorite shopping app!'),
      },
    ],
    [
      {
        id: 'logout',
        title: 'Logout',
        icon: 'log-out-outline',
        type: 'action',
        onPress: handleLogout,
      },
      {
        id: 'delete',
        title: 'Delete Account',
        icon: 'trash-outline',
        type: 'action',
        onPress: handleDeleteAccount,
      },
    ],
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Settings</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.text.secondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: SettingItem[], index: number) => (
    <View key={`section-${index}`} style={styles.section}>
      {section.map(renderSettingItem)}
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
        {settingsSections.map(renderSection)}
      </ScrollView>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  settingRight: {
    marginLeft: SPACING.sm,
  },
});

export default SettingsScreen;
