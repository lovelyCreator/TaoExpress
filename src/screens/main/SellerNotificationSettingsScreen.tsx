import React, { useState } from 'react';
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

type SellerNotificationSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotificationsSettings'>;

interface SellerNotificationSettings {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

const SellerNotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SellerNotificationSettingsScreenNavigationProp>();
  
  const [settings, setSettings] = useState<SellerNotificationSettings>({
    inApp: true,
    email: true,
    sms: false,
    whatsapp: false,
  });

  const handleSettingChange = (key: keyof SellerNotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the API
    Alert.alert('Success', 'Your notification settings have been saved.');
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
              inApp: true,
              email: true,
              sms: false,
              whatsapp: false,
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
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetSettings}
      >
        {/* <Text style={styles.resetButtonText}>Reset</Text> */}
      </TouchableOpacity>
    </View>
  );

  const renderToggleItem = (
    title: string,
    key: keyof SellerNotificationSettings
  ) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <TouchableOpacity 
        style={[styles.radioButton, 
          settings[key] && 
          {backgroundColor: COLORS.accentPink, borderColor: COLORS.accentPink}
        ]}
        onPress={() => handleSettingChange(key, !settings[key])}
      >
        {settings[key] ? (
          <Ionicons name="checkmark" color={COLORS.white} size={14} />
        ) : null}
      </TouchableOpacity>
    </View>
  );

  const renderSaveButton = () => (
    <View style={styles.saveButtonContainer}>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {renderToggleItem('Notification in app', 'inApp')}
            {renderToggleItem('Notification in email', 'email')}
            {renderToggleItem('Notification in SMS', 'sms')}
            {renderToggleItem('Notification in WhatsApp', 'whatsapp')}
          </View>
        </View>
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
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  resetButton: {
    width: 32,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: SPACING.lg,
  },
  section: {
    marginHorizontal: SPACING.md,
  },
  sectionContent: {
    // paddingHorizontal: SPACING.md,
    // paddingVertical: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.smmd,
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
  },
  settingTitle: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  saveButtonContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    // borderTopWidth: 1,
    // borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default SellerNotificationSettingsScreen;