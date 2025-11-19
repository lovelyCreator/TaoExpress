import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';

type ShareAppScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ShareApp'>;

const ShareAppScreen: React.FC = () => {
  const navigation = useNavigation<ShareAppScreenNavigationProp>();

  // App sharing information
  const appName = 'TaoExpress';
  const appUrl = 'https://taoexpress.app'; // Replace with your actual app URL
  const shareMessage = `Check out ${appName}! 🎁\n\nJoin now and get exclusive discounts on all products!\n\nDownload here: ${appUrl}`;

  const handleSharePoster = async () => {
    try {
      const result = await Share.share({
        message: shareMessage,
        title: `Share ${appName}`,
        url: appUrl, // iOS only
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared successfully
          Alert.alert('Success', 'Thank you for sharing!');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleShareLink = async () => {
    try {
      // Copy link to clipboard
      await Clipboard.setStringAsync(appUrl);
      
      // Show share dialog
      const result = await Share.share({
        message: shareMessage,
        url: appUrl, // iOS only
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Link copied and shared!');
      }
    } catch (error: any) {
      // If share fails, at least the link is copied
      Alert.alert('Link Copied', 'The app link has been copied to your clipboard!');
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Share</Text>
      <View style={styles.placeholder} />
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Promotional Poster */}
        <View style={styles.posterContainer}>
          <LinearGradient
            colors={['#1a1a3e', '#2d1b4e', '#4a2c5e']}
            style={styles.poster}
          >
            {/* Decorative Elements */}
            <View style={styles.decorativeElements}>
              <View style={[styles.giftBox, styles.giftBox1]} />
              <View style={[styles.giftBox, styles.giftBox2]} />
              <View style={[styles.giftBox, styles.giftBox3]} />
              <View style={[styles.cloud, styles.cloud1]} />
              <View style={[styles.cloud, styles.cloud2]} />
            </View>

            {/* Main Content */}
            <View style={styles.posterContent}>
              <Text style={styles.appNameKorean}>타오익스</Text>
              <Text style={styles.appNameKorean}>프레스</Text>
              
              <View style={styles.appSharingBadge}>
                <Text style={styles.appSharingText}>APPsharing</Text>
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.mainMessage}>Join now and get</Text>
                <Text style={styles.mainMessage}>exclusive discounts!</Text>
                <Text style={styles.subMessage}>
                  Share with friends and enjoy amazing deals together
                </Text>
              </View>

              {/* Mascot/Character */}
              <View style={styles.mascotContainer}>
                <View style={styles.mascot}>
                  <Text style={styles.mascotEmoji}>🦁</Text>
                </View>
              </View>

              {/* More decorative gift boxes at bottom */}
              <View style={styles.bottomGifts}>
                <View style={[styles.giftBox, styles.giftBox4]} />
                <View style={[styles.giftBox, styles.giftBox5]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Share Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleSharePoster}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={20} color={COLORS.text.primary} />
            <Text style={styles.shareButtonText}>Share Poster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareLink}
            activeOpacity={0.7}
          >
            <Ionicons name="link-outline" size={20} color={COLORS.text.primary} />
            <Text style={styles.shareButtonText}>Share Link</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="gift-outline" size={24} color={COLORS.accentPink} />
            <Text style={styles.infoTitle}>Invite Friends</Text>
            <Text style={styles.infoText}>
              Share the app with your friends and both get rewards!
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="star-outline" size={24} color="#FFD700" />
            <Text style={styles.infoTitle}>Exclusive Deals</Text>
            <Text style={styles.infoText}>
              Get access to special discounts and promotions
            </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  posterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  poster: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
    aspectRatio: 9 / 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  giftBox: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
  },
  giftBox1: {
    top: 40,
    right: 30,
    backgroundColor: '#FF6B9D',
  },
  giftBox2: {
    top: 80,
    left: 20,
    backgroundColor: '#4A90E2',
    width: 35,
    height: 35,
  },
  giftBox3: {
    top: 120,
    right: 50,
    backgroundColor: '#26D0CE',
    width: 30,
    height: 30,
  },
  giftBox4: {
    backgroundColor: '#9C88FF',
    width: 45,
    height: 45,
  },
  giftBox5: {
    backgroundColor: '#FF9500',
    width: 38,
    height: 38,
  },
  cloud: {
    position: 'absolute',
    width: 60,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
  },
  cloud1: {
    top: 60,
    right: 80,
  },
  cloud2: {
    bottom: 200,
    left: 40,
  },
  posterContent: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appNameKorean: {
    fontSize: 48,
    fontWeight: '900',
    color: '#26D0CE',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appSharingBadge: {
    backgroundColor: '#9C88FF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  appSharingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  messageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  mainMessage: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  mascot: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotEmoji: {
    fontSize: 60,
  },
  bottomGifts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.text.primary,
    gap: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  infoContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ShareAppScreen;
