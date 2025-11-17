import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type ProfileSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSettings'>;

const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSettingsScreenNavigationProp>();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.goBack();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Page</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderUserSection = () => (
    <View style={styles.userSection}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            isAuthenticated && user?.avatar 
              ? { uri: user.avatar } 
              : require('../../assets/images/avatar.png')
          }
          style={styles.avatar}
        />
      </View>
      <Text style={styles.changePictureText}>Change Picture</Text>
    </View>
  );

  const showComingSoon = (feature: string) => {
    // Simple alert for features not yet implemented
    console.log(`${feature} feature coming soon`);
  };

  const renderMenuItems = () => {
    const menuItems = [
      {
        icon: 'person-outline',
        title: 'My Details',
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        icon: 'trending-up-outline',
        title: 'Affiliate Marketing',
        onPress: () => showComingSoon('Affiliate Marketing'),
      },
      {
        icon: 'person-outline',
        title: 'Unit',
        onPress: () => showComingSoon('Unit'),
      },
      {
        icon: 'person-outline',
        title: 'Payment Password',
        onPress: () => showComingSoon('Payment Password'),
      },
      {
        icon: 'person-outline',
        title: 'Delete Account',
        onPress: () => showComingSoon('Delete Account'),
      },
      {
        icon: 'person-outline',
        title: 'Invite Code Binding',
        onPress: () => showComingSoon('Invite Code Binding'),
      },
    ];

    return (
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.text.primary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderUserSection()}
        {renderMenuItems()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.sm,
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
  userSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[200],
  },
  changePictureText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
  },
  logoutText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
});

export default ProfileSettingsScreen;