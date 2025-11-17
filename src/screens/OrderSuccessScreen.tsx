import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistory' as never);
  };

  const handleContinueShopping = () => {
    navigation.navigate('Main' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {/* <Ionicons name="checkmark-circle" size={100} color={COLORS.success} /> */}
          <Image source={require('../assets/icons/orderSuccess.png')} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
        </View>
        
        <Text style={styles.title}>Your order was placed successfully!</Text>
        
        <Text style={styles.subtitle}>
          You can view details anytime in your order history.
        </Text>
        
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.orderHistoryButton}
            onPress={handleOrderHistoryPress}
          >
            <Text style={styles.orderHistoryButtonText}>Order History</Text>
          </TouchableOpacity>
          
        </View> */}
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    width: '80%',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    // width: '100%',
    gap: SPACING.md,
  },
  orderHistoryButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  orderHistoryButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
  continueButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

export default OrderSuccessScreen;