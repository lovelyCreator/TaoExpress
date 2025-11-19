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

  // Korean favorite colors for menu icons (same as ProfileScreen)
  const getMenuIconColor = (index: number) => {
    const colors = [
      { bg: '#FFE4E6', icon: '#FF6B9D' }, // Soft pink
      { bg: '#E8F4FD', icon: '#4A90E2' }, // Sky blue
      { bg: '#E8F8F5', icon: '#26D0CE' }, // Mint
      { bg: '#FFF4E6', icon: '#FF9500' }, // Orange
      { bg: '#F3E8FF', icon: '#9C88FF' }, // Lavender
      { bg: '#FFE8E8', icon: '#FF6B6B' }, // Coral
      { bg: '#E8FFE8', icon: '#4CAF50' }, // Green
      { bg: '#FFF0E6', icon: '#FF8A65' }, // Peach
      { bg: '#E6F3FF', icon: '#42A5F5' }, // Light blue
      { bg: '#F0E6FF', icon: '#AB47BC' }, // Purple
      { bg: '#E6FFF0', icon: '#66BB6A' }, // Light green
    ];
    return colors[index % colors.length];
  };

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

  const settingsItems = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      type: 'navigation' as const,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'addresses',
      title: 'Address Book',
      icon: 'location-outline',
      type: 'navigation' as const,
      onPress: () => navigation.navigate('AddressBook' as never),
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: 'card-outline',
      type: 'navigation' as const,
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'notifications-outline',
      type: 'toggle' as const,
      value: pushNotifications,
      onPress: () => setPushNotifications(!pushNotifications),
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'language-outline',
      type: 'navigation' as const,
      onPress: () => navigation.navigate('LanguageSettings'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Privacy Policy', 'Privacy policy coming soon!'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text-outline',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Terms of Service', 'Terms of service coming soon!'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Help & Support', 'Help center coming soon!'),
    },
    {
      id: 'about',
      title: 'About TaoExpress',
      icon: 'information-circle-outline',
      type: 'navigation' as const,
      onPress: () => Alert.alert('About', 'TaoExpress v1.0.0\nYour favorite shopping app!'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      type: 'action' as const,
      onPress: handleLogout,
    },
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

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.firstMenuItem,
                index === settingsItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
              disabled={item.type === 'toggle'}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: getMenuIconColor(index).bg }]}>
                  <Ionicons name={item.icon as any} size={22} color={getMenuIconColor(index).icon} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              
              {item.type === 'toggle' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onPress}
                  trackColor={{ false: COLORS.border, true: '#FF6B9D' }}
                  thumbColor={COLORS.white}
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
              )}
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    backgroundColor: COLORS.white,
  },
  firstMenuItem: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
});

export default SettingsScreen;
