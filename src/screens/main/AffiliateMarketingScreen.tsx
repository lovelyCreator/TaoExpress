import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Share,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../store/hooks';
import { translations } from '../../i18n/translations';

const AffiliateMarketingScreen = () => {
  const navigation = useNavigation();
  const locale = useAppSelector((state) => state.i18n.locale) as 'en' | 'ko' | 'zh';
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  
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

  // Mock affiliate data
  const affiliateCode = 'TA0615061';
  const relatedUsers = 0;
  const income = '$0.00';

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(affiliateCode);
      setCopiedCode(true);
      Alert.alert(t('shareApp.success'), t('profile.invitationCodeCopied'));
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToCopyCode'));
    }
  };

  const handleSaveImage = async () => {
    try {
      Alert.alert(t('profile.comingSoon'), t('profile.saveImageComingSoon'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToSaveImage'));
    }
  };

  const handleShareLink = async () => {
    try {
      const result = await Share.share({
        message: t('profile.joinTodayMall', { code: affiliateCode }),
        title: t('profile.shareInvitationCode'),
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert(t('common.error'), t('profile.failedToShare'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      {/* <LinearGradient
        colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']} */}
      <View
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.affiliateMarketing')}</Text>
        <TouchableOpacity style={styles.eventRuleButton}>
          <Text style={styles.eventRuleText}>{t('profile.eventRule')}</Text>
        </TouchableOpacity>
      {/* </LinearGradient> */}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userSection}>
          <View style={styles.userInfoCard}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require('../../assets/images/avatar.png')}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>user</Text>
              <Text style={styles.userIncome}>{t('profile.income')}: {income}</Text>
            </View>
            <View style={styles.userStats}>
              <Text style={styles.relatedUsers}>{t('profile.relatedUser')}: {relatedUsers}</Text>
              <TouchableOpacity>
                <Text style={styles.detailedPayout}>{t('profile.detailedPayout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Invite Methods Container */}
        <View style={styles.methodsContainer}>
          {/* Invite Method 1 */}
          <View style={styles.inviteCard}>
            <View style={styles.inviteMethodBadge}>
              <Text style={styles.inviteMethodText}>{t('profile.inviteMethod1')}</Text>
            </View>
            <Text style={styles.inviteDescription}>
              {t('profile.inviteDescription')}
            </Text>
            <View style={styles.codeContainer}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{affiliateCode}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Text style={styles.copyButtonText}>{t('profile.copy')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Invite Method 2 */}
          <View style={styles.inviteCard}>
            <View style={styles.inviteMethodBadge}>
              <Text style={styles.inviteMethodText}>{t('profile.inviteMethod2')}</Text>
            </View>
            <Text style={styles.inviteDescription}>
              {t('profile.inviteDescription')}
            </Text>
            
            {/* QR Code / Image Section */}
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="image-outline" size={60} color={COLORS.gray[400]} />
              </View>
              <Text style={styles.qrCodeText}>{affiliateCode}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSaveImage}>
                <Ionicons name="download-outline" size={28} color={COLORS.gray[500]} />
                <Text style={styles.actionButtonText}>{t('profile.saveImage')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShareLink}>
                <Ionicons name="share-social-outline" size={28} color={COLORS.gray[500]} />
                <Text style={styles.actionButtonText}>{t('profile.shareLink')}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
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
  eventRuleButton: {
    backgroundColor: '#003D82',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventRuleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
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
  userInfoCard: {
    backgroundColor: '#003D82',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray[300],
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  userIncome: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  relatedUsers: {
    color: '#FFD700',
    fontSize: FONTS.sizes.sm,
    marginBottom: 4,
  },
  detailedPayout: {
    color: '#FFD700',
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  methodsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  inviteCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inviteMethodBadge: {
    backgroundColor: '#9B7FE8',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  inviteMethodText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  inviteDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  codeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  copyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  copyButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  qrCodeText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default AffiliateMarketingScreen;
