import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

type NotificationsSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationsSettings'>;

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  backInStock: boolean;
  reviews: boolean;
  social: boolean;
  // Add separate settings for each section
  promoEmail: boolean;
  promoNotification: boolean;
  alertEmail: boolean;
  alertNotification: boolean;
}

const NotificationsSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsSettingsScreenNavigationProp>();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newProducts: true,
    priceDrops: true,
    backInStock: true,
    reviews: true,
    social: false,
    // Initialize new settings
    promoEmail: true,
    promoNotification: true,
    alertEmail: true,
    alertNotification: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Mock data - in a real app, this would come from the API
      // For now, we'll use the default settings
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, this would save to the API
      Alert.alert('Success', 'Your notification settings have been saved.');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              orderUpdates: true,
              promotions: true,
              newProducts: true,
              priceDrops: true,
              backInStock: true,
              reviews: true,
              social: false,
              // Reset new settings
              promoEmail: true,
              promoNotification: true,
              alertEmail: true,
              alertNotification: true,
            });
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notification</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderToggleItem = (
    title: string,
    key: keyof NotificationSettings
  ) => (
    <TouchableOpacity style={styles.settingItem}
      onPress={() => handleSettingChange(key, !settings[key])}
      >
      <Text style={styles.settingTitle}>{title}</Text>
      {/* <Switch
        trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
        thumbColor={settings[key] ? COLORS.white : COLORS.white}
        ios_backgroundColor={COLORS.gray[300]}
        onValueChange={(value) => handleSettingChange(key, value)}
        value={settings[key]}
      /> */}
      <View style={[styles.cartCheckBox, settings[key] && styles.cartCheckBoxSelected]}>
        {settings[key] && (
          <Ionicons name="checkmark-sharp" size={12} color={COLORS.white} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderGeneralSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Promo & New Trends</Text>
      <View style={styles.sectionContent}>
        {renderToggleItem('Email', 'promoEmail')}
        {renderToggleItem('Notification', 'promoNotification')}
      </View>
    </View>
  );

  const renderOrderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification, Alert & Exclusive Present</Text>
      <View style={styles.sectionContent}>
        {renderToggleItem('Email', 'alertEmail')}
        {renderToggleItem('Notification', 'alertNotification')}
      </View>
    </View>
  );

  const renderMarketingSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Marketing & Promotions</Text>
      <View style={styles.sectionContent}>
        {renderToggleItem('Promotions', 'promotions')}
        {renderToggleItem('New Products', 'newProducts')}
        {renderToggleItem('Price Drops', 'priceDrops')}
        {renderToggleItem('Back in Stock', 'backInStock')}
        {renderToggleItem('Reviews', 'reviews')}
        {renderToggleItem('Social', 'social')}
      </View>
    </View>
  );

  const renderSaveButton = () => (
    <View style={styles.saveButtonContainer}>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderGeneralSettings()}
        {renderOrderSettings()}
        {/* {renderMarketingSettings()} */}
        {renderSaveButton()}
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.xl,
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
    width: 24,
  },
  resetButton: {
    padding: SPACING.xs,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginBottom: 0,
    borderRadius: BORDER_RADIUS.lg,
    // ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '600',
    color: COLORS.text.primary,
    // padding: SPACING.md,
    paddingBottom: SPACING.sm,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
  },
  sectionContent: {
    // padding: SPACING.sm,
    
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.sm,
    padding: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
    // paddingVertical: SPACING.md,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
  },
  settingTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  cartCheckBox: {
    width: 16,
    height: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCheckBoxSelected: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  saveButtonContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    // borderTopWidth: 1,
    // borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.smmd,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'medium',
    color: COLORS.white,
  },
});

export default NotificationsSettingsScreen;