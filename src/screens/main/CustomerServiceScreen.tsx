import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

const CustomerServiceScreen: React.FC = () => {
  const navigation = useNavigation();

  const handlePhoneCall = () => {
    const phoneNumber = '070-7792-6663';
    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl);
  };

  const handleKakaoTalk = () => {
    // Open KakaoTalk or show message
    console.log('Open KakaoTalk');
    // You can implement deep linking to KakaoTalk here
  };

  const handleOrderTalk = () => {
    // Navigate to order chat or support
    console.log('Open Order Talk');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Service</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerImageWrapper}>
          <Image
            source={require('../../assets/images/sample_newin.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Online Client Center */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Online Client Center</Text>

        {/* Phone Button */}
        <TouchableOpacity
          style={[styles.contactButton, styles.phoneButton]}
          onPress={handlePhoneCall}
        >
          <Ionicons name="call" size={24} color={COLORS.white} />
          <Text style={styles.phoneButtonText}>070-7792-6663</Text>
        </TouchableOpacity>

        {/* Kakao Talk Button */}
        <TouchableOpacity
          style={[styles.contactButton, styles.kakaoButton]}
          onPress={handleKakaoTalk}
        >
          <Ionicons name="chatbubble" size={24} color={COLORS.text.primary} />
          <Text style={styles.kakaoButtonText}>kakao Talk</Text>
        </TouchableOpacity>

        {/* Order Talk Button */}
        <TouchableOpacity
          style={[styles.contactButton, styles.orderButton]}
          onPress={handleOrderTalk}
        >
          <Ionicons name="chatbubbles" size={24} color={COLORS.text.primary} />
          <Text style={styles.orderButtonText}>Order Talk</Text>
        </TouchableOpacity>
      </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  bannerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  bannerImageWrapper: {
    width: '100%',
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.gray[200],
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  phoneButton: {
    backgroundColor: '#4A90E2',
  },
  phoneButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  kakaoButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  orderButton: {
    backgroundColor: '#D4F1F4',
  },
  orderButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

export default CustomerServiceScreen;
