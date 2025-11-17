import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

type WithdrawConfirmScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WithdrawConfirm'>;
type WithdrawConfirmScreenRouteProp = RouteProp<RootStackParamList, 'WithdrawConfirm'>;

const WithdrawConfirmScreen: React.FC = () => {
  const navigation = useNavigation<WithdrawConfirmScreenNavigationProp>();
  const route = useRoute<WithdrawConfirmScreenRouteProp>();
  const { amount } = route.params;
  
  const handleWithdraw = () => {
    // In a real app, this would process the withdrawal
    console.log('Withdraw amount:', amount);
    navigation.navigate('WithdrawSuccess');
  };

  const handleEditAmount = () => {
    // Go back to the previous screen to edit the amount
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Confirm Withdrawal</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.centerContent}>
            <Text style={styles.amountText}>${amount}</Text>
            <TouchableOpacity onPress={handleEditAmount} style={styles.editButton}>
              {/* <Text style={styles.editButtonText}>Edit</Text> */}
              <Ionicons name='pencil-sharp' size={20}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={handleWithdraw}
          >
            <Text style={styles.withdrawButtonText}>Transfer ${amount} Now</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '60%',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  editButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 16,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  withdrawButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default WithdrawConfirmScreen;