import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

type WithdrawScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Withdraw'>;

const WithdrawSuccessScreen: React.FC = () => {
  const navigation = useNavigation<WithdrawScreenNavigationProp>();
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const availableBalance = 1000;
  
  // Validate the withdrawal amount
  const isAmountValid = () => {
    if (!withdrawAmount) return false;
    const amount = parseFloat(withdrawAmount);
    return amount > 0 && amount <= availableBalance;
  };

  const handleNext = () => {
    // Navigate to the confirmation/withdraw page
    navigation.navigate('Finance');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Finance')}
      >
        <Ionicons name="close" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      {/* <Text style={styles.headerTitle}>Withdraw</Text> */}
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}      
      <View style={styles.scrollView}>
        <View style={styles.content}>
          {/* // Center content with editable balance */}
          <View style={styles.centerContent}>
            <Image source={require('../../assets/icons/withdraw.png')} style={styles.image} resizeMode="contain"/>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>Withdrawal Successful!</Text>
            </View>
            <Text style={styles.balanceInfo}>Easily track your withdrawal progress and stay informed about your transactions!</Text>
            
            {/* Show error message if amount is invalid */}
            {!isAmountValid() && withdrawAmount !== '' && (
              <Text style={styles.errorMessage}>
                {parseFloat(withdrawAmount) > availableBalance 
                  ? 'Amount exceeds available balance' 
                  : 'Amount must be greater than $0'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
            // disabled={!isAmountValid()}
          >
            <Text style={styles.nextButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
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
    padding: SPACING.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '30%'
  },
  content: {
    padding: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    minWidth: 0,
    padding: 0,
  },
  balanceInfo: {
    fontSize: 14,
    color: COLORS.gray[400],
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.accentPink,
    marginTop: 12,
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 16,
    flex: 1,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: COLORS.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  image: {

  },
});

export default WithdrawSuccessScreen;