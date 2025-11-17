import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { GlowmifyLogo } from '../../components';

const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        {/* <Text style={styles.headerTitle}>About Us</Text> */}
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <GlowmifyLogo size={20} showText={false} />
            {/* <Text style={styles.appName}>TaoExpress</Text> */}
          </View>
          
          <Text style={styles.sectionTitle}>About Us</Text>
          
          <Text style={styles.description}>
            At TaoExpress, we believe shopping should be more than just a transaction it should be an experience.
          </Text>
          
          <Text style={styles.description}>
            That’s why we’ve built a shoppable video marketplace where fashion, beauty, and lifestyle products come to life through engaging videos and visuals. 
          </Text>
          
          <Text style={styles.description}>
            Our mission is simple: 
          </Text>
          
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.dot}>
              •
            </Text>
            <Text style={styles.description}>
              Empower sellers to showcase their products in the most authentic and interactive way. 
            </Text>
          </View>
          
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.dot}>
              •
            </Text>
            <Text style={styles.description}>
              Inspire buyers with a seamless, enjoyable, and trusted shopping journey.
            </Text>
          </View>
          
          <Text style={styles.description}>
            From trending fashion pieces to timeless accessories, TaoExpress brings together a vibrant community of creators, brands, and shoppers in one easy-to-use platform. 
          </Text>

          <Text style={styles.description}>
            Whether you’re discovering new styles, connecting with trusted sellers, or sharing your own products with the world — TaoExpress makes it effortless, engaging, and fun.
          </Text>

          <Text style={styles.description}>
            TaoExpress — Where shopping meets inspiration.
          </Text>

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  logoSection: {
    alignItems: 'center',
    // marginBottom: SPACING.xl,
  },
  appName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    lineHeight: 22,
    // marginBottom: SPACING.lg,
  },
  dot: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    width: SPACING.md,
  }
});

export default AboutUsScreen;
