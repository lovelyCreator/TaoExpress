import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGustLoginMutation } from '../hooks/useAuthMutations';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList } from '../types';
import { useToast } from '../context/ToastContext';
import { useAppSelector } from '../store/hooks';
import { translations } from '../i18n/translations';

const Onboard1Svg = require('../assets/icons/onboard1.png');
const Onboard2Svg = require('../assets/icons/onboard2.png');
const Onboard3Svg = require('../assets/icons/onboard3.png');
const Onboard4Svg = require('../assets/icons/onboard4.png');

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration: 'video' | 'products' | 'reviews' | 'marketplace';
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Shop Through Engaging Videos',
    description: 'Discover fashion, beauty, and jewelry products brought to life with immersive short videos.',
    illustration: 'video',
  },
  {
    id: '2',
    title: 'Everything You Love, All in One Place',
    description: 'From trending outfits to must-have accessories explore curated collections anytime.',
    illustration: 'products',
  },
  {
    id: '3',
    title: 'Trusted Ratings & Reviews',
    description: 'Shop confidently with real ratings, reviews, and product details at a glance.',
    illustration: 'reviews',
  },
  {
    id: '4',
    title: 'Glowmify Marketplace',
    description: 'A premium destination for discovering, exploring, and shopping your next favorite style.',
    illustration: 'marketplace',
  },
];

// Function to register guest with API
const registerGuest = async (): Promise<number | null> => {
  try {
    // In a real app, you would get the actual FCM token using expo-notifications
    // For now, we're using a placeholder value as specified in the API
    const fcmToken = '@'; // Placeholder as specified in the API
    
    const response = await fetch('http://192.168.5.54/api/v1/auth/guest/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcm_token: fcmToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Guest registration response:', data);
    
    // Return the guest_id from the response
    return data.guest_id;
  } catch (error) {
    console.error('Error registering guest:', error);
    Alert.alert('Error', 'Failed to register guest. Please try again.');
    return null;
  }
};

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const locale = useAppSelector((state) => state.i18n.locale);
  const t = (key: string) => {
    const dict: any = (translations as any)[locale] || (translations as any).en;
    const val = key.split('.').reduce((o: any, k: string) => (o && o[k] !== undefined ? o[k] : undefined), dict);
    if (val !== undefined) return String(val);
    const fallback = key.split('.').reduce((o: any, k: string) => (o && o[k] !== undefined ? o[k] : undefined), (translations as any).en);
    return fallback !== undefined ? String(fallback) : key;
  };
  const { mutate: guestLogin, isLoading, isError, error, isSuccess, data } = useGustLoginMutation({
    onSuccess: async (data) => {
      console.log('Guest Login Success', data);
      await AsyncStorage.setItem('onboarding_completed', 'true');
      navigation.navigate('Main' as never);
    },
    onError: (error) => {
      console.log('Guest Login Error:', error);
      showToast(
        t('errors.guestRegisterFailed'),
        'error'
      );
    }
  });
  const fcmToken = '@'; 
  const [currentIndex, setCurrentIndex] = useState(0);
  const onboardingSlidesT: OnboardingSlide[] = [
    { id: '1', title: t('onboarding.slide1.title'), description: t('onboarding.slide1.description'), illustration: 'video' },
    { id: '2', title: t('onboarding.slide2.title'), description: t('onboarding.slide2.description'), illustration: 'products' },
    { id: '3', title: t('onboarding.slide3.title'), description: t('onboarding.slide3.description'), illustration: 'reviews' },
    { id: '4', title: t('onboarding.slide4.title'), description: t('onboarding.slide4.description'), illustration: 'marketplace' },
  ];
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const imageSources = [Onboard1Svg, Onboard2Svg, Onboard3Svg, Onboard4Svg];

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasGuestLoginError, setHasGuestLoginError] = useState(false);
  const handleNext = async () => {
    if (currentIndex < onboardingSlidesT.length - 1) {
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        // Switch image when faded out
        setCurrentIndex(prev => prev + 1);
        imageScale.setValue(0.96);
        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(imageScale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      console.log("GuestLogin: GuestLogin Called");
      setErrors({});
      setHasGuestLoginError(false);

      console.log('GuestLogin: GuestLogin called');
      await guestLogin({
        fcm_token: '@',
      });
      console.log('GuestLogin: GuestLogin Completed');
    }
  };

  const currentImage = imageSources[currentIndex];


  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <Animated.Image
            source={currentImage}
            style={{ width: 301, height: 300, transform: [{ scale: imageScale }], opacity: imageOpacity }}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.contentCard}>
          <Text style={styles.slideTitle}>{onboardingSlidesT[currentIndex].title}</Text>
          <Text style={styles.slideDescription}>{onboardingSlidesT[currentIndex].description}</Text>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingSlidesT.length - 1 ? t('onboarding.startShopping') : t('common.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.onboardingBackground,
    paddingTop: 50, // Account for status bar
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  slideContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.sm,
    ...SHADOWS.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  slideTitle: {
    fontSize: 21,
    fontFamily: 'Satoshi',
    fontWeight: 700,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideDescription: {
    fontSize: FONTS.sizes.sm,
    fontFamily: 'Satoshi',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.mdlg,
  },
  nextButton: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONTS.sizes.base,
    fontFamily: 'Satoshi',
    color: COLORS.white,
  },
  // Illustration styles
  videoIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  productsIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  reviewsIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  marketplaceIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
});

export default OnboardingScreen;