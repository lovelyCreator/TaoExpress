import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import { DatePickerModal } from '../../components';

interface Transaction {
  id: number;
  type: 'charge' | 'discharge';
  amount: number;
  date: string;
  time: string;
  description: string;
  status: string;
}

const DepositScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'charge' | 'discharge'>('charge');
  // const [selectedItems, setSelectedItems] = useState<number[]>([]); // Commented out - delete feature disabled
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'charge', amount: 50000, date: '2024-11-18', time: '14:30', description: 'Bank Transfer Deposit', status: 'completed' },
    { id: 2, type: 'discharge', amount: 15000, date: '2024-11-17', time: '10:15', description: 'Product Purchase #12345', status: 'completed' },
    { id: 3, type: 'charge', amount: 100000, date: '2024-11-15', time: '09:20', description: 'Credit Card Deposit', status: 'completed' },
    { id: 4, type: 'discharge', amount: 25000, date: '2024-11-14', time: '16:45', description: 'Shipping Fee Payment', status: 'completed' },
    { id: 5, type: 'charge', amount: 75000, date: '2024-11-12', time: '11:30', description: 'Bank Transfer Deposit', status: 'completed' },
    { id: 6, type: 'discharge', amount: 30000, date: '2024-11-10', time: '13:20', description: 'Product Purchase #12340', status: 'completed' },
    { id: 7, type: 'charge', amount: 200000, date: '2024-11-08', time: '16:00', description: 'Bank Transfer Deposit', status: 'completed' },
    { id: 8, type: 'discharge', amount: 45000, date: '2024-11-05', time: '11:45', description: 'Product Purchase #12338', status: 'completed' },
  ]);

  const depositBalance = 0;

  // Filter transactions based on search, date range, and active tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filter by tab
      if (t.type !== activeTab) return false;

      // Filter by search query
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by date range
      if (startDate || endDate) {
        const transactionDate = new Date(t.date);
        if (startDate && transactionDate < startDate) return false;
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (transactionDate > endOfDay) return false;
        }
      }

      return true;
    });
  }, [transactions, activeTab, searchQuery, startDate, endDate]);

  const handleSearch = () => {
    // Search is handled automatically by useMemo
    console.log('Searching with:', { searchQuery, startDate, endDate });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
  };

  // Delete functionality commented out
  // const handleDeleteSelected = () => {
  //   if (selectedItems.length === 0) return;
  //   setTransactions(prev => prev.filter(t => !selectedItems.includes(t.id)));
  //   setSelectedItems([]);
  // };

  // const toggleSelectItem = (id: number) => {
  //   setSelectedItems(prev => 
  //     prev.includes(id) 
  //       ? prev.filter(itemId => itemId !== id)
  //       : [...prev, id]
  //   );
  // };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
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
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit</Text>
        <View style={styles.placeholder} />
      {/* </LinearGradient> */}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Deposit Money</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Charge')}>
                <Text style={styles.chargeLink}>Charge Record</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>${depositBalance}</Text>
            
            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'charge' && styles.tabButtonActive
                ]}
                onPress={() => (navigation as any).navigate('Charge')}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'charge' && styles.tabButtonTextActive
                ]}>
                  Charge
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'discharge' && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab('discharge')}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'discharge' && styles.tabButtonTextActive
                ]}>
                  Discharge
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Filter Card */}
          <View style={styles.filterCard}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRow}>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                  {startDate ? formatDate(startDate) : 'start'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>-</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                  {endDate ? formatDate(endDate) : 'end'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearFilters}>
                <Text style={styles.deleteButton}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Delete Selected Button - Commented Out */}
            {/* {selectedItems.length > 0 && (
              <TouchableOpacity 
                style={styles.deleteSelectedButton}
                onPress={handleDeleteSelected}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                <Text style={styles.deleteSelectedText}>
                  Delete Selected ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            )} */}
          </View>

          {/* Date Picker Modals */}
          <DatePickerModal
            visible={showStartPicker}
            onClose={() => setShowStartPicker(false)}
            onConfirm={handleStartDateConfirm}
            initialDate={startDate || undefined}
            title="Select Start Date"
          />

          <DatePickerModal
            visible={showEndPicker}
            onClose={() => setShowEndPicker(false)}
            onConfirm={handleEndDateConfirm}
            initialDate={endDate || undefined}
            title="Select End Date"
          />

          {/* Transactions List or Empty State */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications" size={100} color="#4A90E2" />
              <Text style={styles.emptyText}>No Data</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((transaction) => {
                // Selection functionality commented out
                // const isSelected = selectedItems.includes(transaction.id);
                return (
                  <View
                    key={transaction.id}
                    style={styles.transactionCard}
                  >
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionDate}>{transaction.date} {transaction.time}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.type === 'charge' ? styles.chargeAmount : styles.dischargeAmount
                    ]}>
                      {transaction.type === 'charge' ? '+' : '-'}₩{transaction.amount.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
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
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  balanceLabel: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  chargeLink: {
    fontSize: FONTS.sizes.md,
    color: '#4A90E2',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF9500',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  tabButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tabButtonText: {
    fontSize: FONTS.sizes.md,
    color: '#FF9500',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  filterCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  placeholderText: {
    color: '#999',
  },
  dateSeparator: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    color: '#4A90E2',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    paddingHorizontal: SPACING.xs,
  },
  // Commented out - delete feature disabled
  // deleteSelectedButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: '#FF6B6B',
  //   borderRadius: 20,
  //   paddingVertical: 12,
  //   marginTop: SPACING.md,
  //   gap: SPACING.xs,
  // },
  // deleteSelectedText: {
  //   color: COLORS.white,
  //   fontSize: FONTS.sizes.md,
  //   fontWeight: '600',
  // },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 3,
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    fontWeight: '600',
  },
  transactionsList: {
    gap: SPACING.sm,
  },
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  // Commented out - selection feature disabled
  // transactionCardSelected: {
  //   borderColor: '#4A90E2',
  //   borderWidth: 2,
  //   backgroundColor: '#F0F8FF',
  // },
  // transactionLeft: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   flex: 1,
  // },
  // checkbox: {
  //   width: 24,
  //   height: 24,
  //   borderRadius: 12,
  //   borderWidth: 2,
  //   borderColor: '#CCC',
  //   marginRight: SPACING.md,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // checkboxSelected: {
  //   backgroundColor: '#4A90E2',
  //   borderColor: '#4A90E2',
  // },
  transactionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  transactionDescription: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  transactionDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  transactionAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  chargeAmount: {
    color: '#4CAF50',
  },
  dischargeAmount: {
    color: '#FF6B6B',
  },
});

export default DepositScreen;
