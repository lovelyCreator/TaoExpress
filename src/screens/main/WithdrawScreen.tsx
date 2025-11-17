import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

type WithdrawScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Withdraw'>;

const WithdrawScreen: React.FC = () => {
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
    navigation.navigate('WithdrawConfirm', { amount: withdrawAmount || '0' });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Withdraw</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* // Center content with editable balance */}
          <View style={styles.centerContent}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>
            <Text style={styles.balanceInfo}>TaoExpress balance: ${availableBalance} USD (available)</Text>
            
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
            style={[styles.nextButton, !isAmountValid() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!isAmountValid()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
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
  },
  content: {
    padding: 16,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '60%',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 48,
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
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: 16,
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
});

export default WithdrawScreen;