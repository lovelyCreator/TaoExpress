import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const handleOrderInquiry = () => {
    // Navigate to Order Inquiry screen
    (navigation as any).navigate('OrderInquiry');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Service</Text>
        <View style={styles.placeholder} />
      </View>

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

        {/* Order Inquiry Button */}
        <TouchableOpacity
          style={[styles.contactButton, styles.orderButton]}
          onPress={handleOrderInquiry}
        >
          <Ionicons name="document-text" size={24} color={COLORS.text.primary} />
          <Text style={styles.orderButtonText}>Order Inquiry</Text>
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
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
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
    fontSize: FONTS.sizes['xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  bannerContainer: {
    paddingHorizontal: SPACING.lg,
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
    paddingHorizontal: SPACING.lg,
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
