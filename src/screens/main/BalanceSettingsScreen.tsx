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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

type BalanceSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BalanceSettings'>;

const BalanceSettingsScreen: React.FC = () => {
  const navigation = useNavigation<BalanceSettingsScreenNavigationProp>();

  const balanceItems = [
    {
      icon: 'card-outline',
      title: 'Bank Account/Card',
      onPress: () => navigation.navigate('BankAccount'),
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Blanace Settings</Text>
      <TouchableOpacity onPress={() => navigation.navigate('BankAccount')} style={styles.backButton}>
        <Ionicons name="settings-outline" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderBalanceItem = (item: { icon: string; title: string; onPress: () => void }, index: number) => (
    <TouchableOpacity
      key={`balance-item-${index}`}
      style={styles.activityItem}
      onPress={item.onPress}
    >
      <View style={styles.activityItemLeft}>
        {/* <View style={styles.activityIcon}>
          <Ionicons name={item.icon as any} size={20} color={COLORS.text.primary} />
        </View> */}
        <Text style={styles.activityText}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.activitySection}>
          {balanceItems.map((item, index) => renderBalanceItem(item, index))}
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
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  activitySection: {
    marginHorizontal: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.smmd,
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  activityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityText: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default BalanceSettingsScreen;