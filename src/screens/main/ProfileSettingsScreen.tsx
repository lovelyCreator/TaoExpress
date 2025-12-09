import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING } from '../../constants';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ImagePickerModal from '../../components/ImagePickerModal';
import { DeleteAccountModal } from '../../components';
import { InviteCodeBindingModal } from '../../components';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

type ProfileSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSettings'>;

const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSettingsScreenNavigationProp>();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const locale = useAppSelector((state) => state.i18n.locale) as 'en' | 'ko' | 'zh';
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
  
  // Translation function
  const t = (key: string, params?: { [key: string]: string }) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    if (params && typeof value === 'string') {
      Object.keys(params).forEach(paramKey => {
        value = value.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    return value || key;
  };

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

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const showComingSoon = (feature: string) => {
    console.log(`${feature} feature coming soon`);
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      // TODO: Implement actual API call to delete account with password verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        t('profile.accountDeleted'),
        t('profile.accountDeletedMessage'),
        [
          {
            text: t('profile.ok'),
            onPress: async () => {
              await logout();
              navigation.navigate('Auth');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToDeleteAccount'));
      throw error;
    }
  };

  const handleBindInviteCode = async (inviteCode: string) => {
    try {
      // TODO: Implement actual API call to bind invite code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        t('shareApp.success'),
        t('profile.inviteCodeBound', { inviteCode }),
        [{ text: t('profile.ok') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToBindCode'));
      throw error;
    }
  };

  const handleTakePhoto = async () => {
    // Import ImagePicker
    const ImagePicker = require('expo-image-picker');
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert(t('profile.cameraPermissionRequired'));
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      if (updateUser) {
        await updateUser({ avatar: uri });
      }
    }
    setShowImagePicker(false);
  };

  const handleChooseFromGallery = async () => {
    // Import ImagePicker
    const ImagePicker = require('expo-image-picker');
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('profile.galleryPermissionRequired'));
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      if (updateUser) {
        await updateUser({ avatar: uri });
      }
    }
    setShowImagePicker(false);
  };

  const renderHeader = () => (
    // <LinearGradient
    //   colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
    <View
      style={styles.header}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('profile.myPage')}</Text>
      <View style={styles.placeholder} />
    {/* </LinearGradient> */}
    </View>
  );

  const renderUserSection = () => (
    <View style={styles.userSection}>
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              avatarUri
                ? { uri: avatarUri } 
                : require('../../assets/images/avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.avatarBorder} />
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Ionicons name="camera" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.changePictureText}>{t('profile.changePicture')}</Text>
        {isAuthenticated && user?.name && (
          <Text style={styles.userName}>{user.name}</Text>
        )}
      </View>
    </View>
  );

  const renderMenuItems = () => {
    const menuItems = [
      {
        icon: 'person-outline',
        title: t('profile.myDetails'),
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        icon: 'key-outline',
        title: t('profile.changePassword'),
        onPress: () => navigation.navigate('ChangePassword'),
      },
      {
        icon: 'trending-up-outline',
        title: t('profile.affiliateMarketing'),
        onPress: () => navigation.navigate('AffiliateMarketing' as never),
      },
      {
        icon: 'cube-outline',
        title: t('profile.unit'),
        onPress: () => navigation.navigate('UnitSettings'),
      },
      {
        icon: 'lock-closed-outline',
        title: t('profile.paymentPassword'),
        onPress: () => navigation.navigate('PaymentPassword'),
      },
      {
        icon: 'trash-outline',
        title: t('profile.deleteAccount'),
        onPress: () => setShowDeleteModal(true),
      },
      {
        icon: 'gift-outline',
        title: t('profile.inviteCodeBinding'),
        onPress: () => setShowInviteCodeModal(true),
      },
    ];

    return (
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === 0 && styles.firstMenuItem,
              index === menuItems.length - 1 && styles.lastMenuItem
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: getMenuIconColor(index).bg }]}>
                <Ionicons name={item.icon as any} size={22} color={getMenuIconColor(index).icon} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
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
        
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            </View>
            <Text style={styles.logoutText}>{t('profile.logOut')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />

      <InviteCodeBindingModal
        visible={showInviteCodeModal}
        onClose={() => setShowInviteCodeModal(false)}
        onSubmit={handleBindInviteCode}
      />
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
    paddingBottom: SPACING.lg,
    // marginBottom: SPACING.md,
    paddingTop: SPACING['2xl'],
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
  userSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginTop: -20,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[200],
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: '#FF9A9E',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePictureText: {
    fontSize: FONTS.sizes.md,
    color: '#FF6B9D',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  menuContainer: {
    marginHorizontal: SPACING.lg,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: 100,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFE4E6',
  },
  logoutIconContainer: {
    marginRight: SPACING.md,
  },
  logoutText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
});

export default ProfileSettingsScreen;
