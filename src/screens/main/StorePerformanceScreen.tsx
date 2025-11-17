import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PerformanceDataParams, RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { userProfileApi } from '../../services/userProfileApi';

type StorePerformanceNavigationProp = StackNavigationProp<RootStackParamList, 'StorePerformance'>;

interface PerformanceData {
  sales?: number;
  order_count?: number;
  sales_per_order?: number;
  buyers?: number;
  sales_per_buyer?: number;
  order_conversion_rate?: number;
  // add other fields returned by API if needed
}

const StorePerformanceScreen: React.FC = () => {
  const navigation = useNavigation<StorePerformanceNavigationProp>();
  const [selectedPeriod, setSelectedPeriod] = useState<'real-time' | 'yesterday' | 'last-7days' | 'last-30days'>('real-time');
  const [selectedTab, setSelectedTab] = useState<'sent' | 'confirmed'>('sent');
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  const fetchStorePerformance = async () => {
    console.log('selectedPeriod:', selectedPeriod);
    console.log('selectedTab:', selectedTab);
    try {
      const response = await userProfileApi.getStorePerformance({
        period: selectedPeriod,
        status: selectedTab,
      } );

      // defensive: response.data may be null or different shape
      const data = (response && (response as any).data) ?? null;
      console.log('Performance response (raw):', data);
      setPerformanceData(data as PerformanceData);
    } catch (error) {
      console.error('Error fetching store performance data:', error);
    }
  };

  useEffect(() => {
    fetchStorePerformance();
  }, [selectedPeriod, selectedTab]);

  const periods = [
    { label: 'Real-time', value: 'real-time' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'last-7days' },
    { label: 'Last 30 days', value: 'last-30days' },
  ];

  const tabs = [
    { label: 'Order Ready to Sent', value: 'sent' },
    { label: 'Order Created', value: 'confirmed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Store Performance</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.periodContainer}>
        <View style={styles.periodLabels}>
          <Text style={styles.periodLabel}>Period</Text>
          <Text style={styles.periodLabelUpdate}>Last updated on 07:58</Text>
        </View>
        <ScrollView style={styles.periodButtons} horizontal={true} showsHorizontalScrollIndicator={false}>
          {periods.map((period, index) => (
            <TouchableOpacity
              key={`period-${index}`}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.selectedPeriodButton,
                index === periods.length - 1 && { marginRight: SPACING.smmd },
              ]}
              onPress={() => setSelectedPeriod(period.value as any)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.selectedPeriodButtonText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mainCriteriaContainer}>
          <Text style={styles.mainCriteriaTitle}>Main Criteria</Text>
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.tabButton,
                  selectedTab === tab.value && styles.selectedTabButton,
                ]}
                onPress={() => setSelectedTab(tab.value as any)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === tab.value && styles.selectedTabButtonText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Sales</Text>
              <Text style={styles.cardValue}>${performanceData?.sales ?? 0}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Order</Text>
              <Text style={styles.cardValue}>{performanceData?.order_count ?? 0}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Sales per Order</Text>
              <Text style={styles.cardValue}>${performanceData?.sales_per_order ?? 0}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Buyer</Text>
              <Text style={styles.cardValue}>{performanceData?.buyers ?? 0}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Sales per Buyer</Text>
              <Text style={styles.cardValue}>${performanceData?.sales_per_buyer ?? 0}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Order Conversion Rate</Text>
              <Text style={styles.cardValue}>{performanceData?.order_conversion_rate ?? 0}</Text>
            </View>
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
    padding: SPACING.md,
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
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  periodContainer: {
    margin: SPACING.md,
    paddingVertical: SPACING.smmd,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray['100'],
    borderRadius: BORDER_RADIUS.xl,
  },
  periodLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.smmd,
  },
  periodLabel: {
    fontSize: FONTS.sizes.smmd,
    color: COLORS.text.primary,
  },
  periodLabelUpdate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  periodButtons: {
    flexDirection: 'row',
    paddingTop: SPACING.sm,
  },
  periodButton: {
    paddingHorizontal: SPACING.smmd,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray[50],
    marginLeft: SPACING.smmd,
  },
  // simplified: use the same color or define a light variant in COLORS
  selectedPeriodButton: {
    borderColor: COLORS.accentPink,
    backgroundColor: COLORS.accentPink,
  },
  periodButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  selectedPeriodButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  tabButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[50],
    width: '48%',
  },
  selectedTabButton: {
    borderColor: COLORS.accentPink,
    backgroundColor: COLORS.white,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedTabButtonText: {
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  content: {},
  mainCriteriaContainer: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    padding: SPACING.smmd,
  },
  mainCriteriaTitle: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 80,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: COLORS.white,
    height: 120,
  },
  cardLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[400],
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
});

export default StorePerformanceScreen;
