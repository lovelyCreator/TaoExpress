import React, { useState } from 'react';
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

type BankAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BankAccount'>;

const BankAccountScreen: React.FC = () => {
  const navigation = useNavigation<BankAccountScreenNavigationProp>();
  
  const [accountInfo, setAccountInfo] = useState({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
  });

  const handleSave = () => {
    // In a real app, this would save the bank account information
    console.log('Bank account saved:', accountInfo);
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
      <Text style={styles.headerTitle}>Bank Account</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* <Text style={styles.sectionTitle}>Bank Account Information</Text> */}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput
              style={styles.textInput}
              value={accountInfo.bankName}
              onChangeText={(text) => setAccountInfo({...accountInfo, bankName: text})}
              placeholder="Enter bank name"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>
          {/* <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.textInput}
              value={accountInfo.accountHolderName}
              onChangeText={(text) => setAccountInfo({...accountInfo, accountHolderName: text})}
              placeholder="Enter account holder name"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View> */}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>No. Account</Text>
            <TextInput
              style={styles.textInput}
              value={accountInfo.accountNumber}
              onChangeText={(text) => setAccountInfo({...accountInfo, accountNumber: text})}
              placeholder="Enter account number"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
            />
          </View>
          
          {/* <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Routing Number</Text>
            <TextInput
              style={styles.textInput}
              value={accountInfo.routingNumber}
              onChangeText={(text) => setAccountInfo({...accountInfo, routingNumber: text})}
              placeholder="Enter routing number"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
            />
          </View> */}
          
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
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
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: 12,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BankAccountScreen;