import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING } from '../../constants';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../store/hooks';


type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const currentLocale = useAppSelector((state) => state.i18n.locale);
  const badgePulse = useRef(new Animated.Value(1)).current;
  const notificationCount = 1; // You can make this dynamic

  // Map language codes to flag emojis
  const getLanguageFlag = (locale: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'ko': '🇰🇷',
      'zh': '🇨🇳',
    };
    return flags[locale] || '🇺🇸';
  };

  useEffect(() => {
    if (notificationCount > 0) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      badgePulse.setValue(1);
    }
  }, [notificationCount]);


  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const showComingSoon = (feature: string) => {
    console.log(`${feature} feature coming soon`);
    // You can add an alert or toast here if needed
  };

  // Korean favorite colors for menu icons
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

  const renderHeader = () => (
    // <LinearGradient
    //   colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
    <View
      style={styles.header}
    >
      <Text style={styles.headerTitle}>My Profile</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('LanguageSettings')}
        >
          <Text style={styles.flagText}>{getLanguageFlag(currentLocale)}</Text>
        </TouchableOpacity>
        {isAuthenticated && (
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('CustomerService')}
        >
          <Ionicons name="headset-outline" size={24} color={COLORS.text.primary} />
          {notificationCount > 0 && (
            <Animated.View
              style={[
                styles.notificationBadge,
                { transform: [{ scale: badgePulse }] }
              ]}
            >
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    {/* </LinearGradient> */}
    </View>
  );

  const renderUserSection = () => (
    <View style={styles.userSection}>
      <View style={styles.userCard}>
        {isAuthenticated ? (
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  user?.avatar 
                    ? { uri: user.avatar } 
                    : require('../../assets/images/avatar.png')
                }
                style={styles.avatar}
              />
              <View style={styles.avatarBorder} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.name || 'User'}
              </Text>
              <View style={styles.userBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified Member</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('ProfileSettings')}
              >
                <Ionicons name="pencil" size={14} color={COLORS.primary} />
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.authSection}>
            <Text style={styles.welcomeText}>
              Welcome to TodayMall!
            </Text>
            <Text style={styles.loginPrompt}>
              Login to access more services
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsCard}>
        {/* <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Deposit')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="wallet-outline" size={24} color="#FF6B9D" />
          </View>
          <Text style={styles.statValue}>₩0</Text>
          <Text style={styles.statLabel}>Deposit</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} /> */}
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('PointDetail')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F4FD' }]}>
            <Ionicons name="diamond-outline" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.statValue}>100</Text>
          <Text style={styles.statLabel}>Points</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F8F5' }]}>
            <Ionicons name="heart-outline" size={24} color="#26D0CE" />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Coupon')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#FFF4E6' }]}>
            <Ionicons name="ticket-outline" size={24} color="#FF9500" />
          </View>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Coupons</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMenuItems = () => {
    // BUYING-RELATED ITEMS (Only show when logged in)
    const buyingMenuItems = [
      // 1. START: Place New Orders
      {
        icon: 'bag-outline',
        title: 'Buy Order',
        onPress: () => navigation.navigate('BuyList'),
      },
      
      // 2. SETUP: Required for Buying (Address & Payment)
      {
        icon: 'location-outline',
        title: 'Address',
        onPress: () => navigation.navigate('AddressBook', { fromShippingSettings: false }),
      },
      {
        icon: 'card-outline',
        title: 'Bank Card',
        onPress: () => navigation.navigate('PaymentMethods' as never),
      },
      
      // 3. ISSUES: Problems with Orders/Products
      {
        icon: 'alert-circle-outline',
        title: 'Problem Product',
        onPress: () => navigation.navigate('ProblemProduct' as never),
      },
    ];

    // NON-BUYING RELATED ITEMS (Always show regardless of login status)
    const generalMenuItems = [
      // Support & Help
      {
        icon: 'help-circle-outline',
        title: 'Help Center',
        onPress: () => navigation.navigate('HelpCenter'),
      },
      
      // Personal Features
      {
        icon: 'document-text-outline',
        title: 'Note',
        onPress: () => navigation.navigate('Note' as never),
      },
      
      // Social Features
      {
        icon: 'share-outline',
        title: 'Share App',
        onPress: () => navigation.navigate('ShareApp' as never),
      },
      

    ];

    // Combine items based on authentication status
    const menuItems = [
      ...(isAuthenticated ? buyingMenuItems : []), // Only show buying items when logged in
      ...generalMenuItems // Always show general items
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
        {isAuthenticated && renderStatsSection()}
        {renderMenuItems()}
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
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagCircle: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    height: 36,
  },
  flagText: {
    fontSize: 24,
  },
  headerIcon: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    minHeight: '100%',
  },
  userSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl, // Add bottom padding for spacing
    marginTop: -20,
  },
  userCard: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gray[200],
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FF9A9E', // Korean favorite coral pink
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  verifiedText: {
    fontSize: FONTS.sizes.sm,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6', // Soft pink background
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  editText: {
    fontSize: FONTS.sizes.sm,
    color: '#FF6B9D', // Pink text
    marginLeft: 4,
    fontWeight: '500',
  },
  authSection: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  welcomeText: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0055',
    borderRadius: 9999,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  loginButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl, // Add bottom padding for spacing
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.xl,
    flexDirection: 'row',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  menuContainer: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom:  100,
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
});

export default ProfileScreen;