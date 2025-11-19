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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';

interface PointTransaction {
  id: number;
  title: string;
  orderId?: string;
  date: string;
  time: string;
  pointsBefore: number;
  pointsAfter: number;
  pointsChange: number;
  type: 'earn' | 'spend';
}

const PointDetailScreen = () => {
  const navigation = useNavigation();

  // Sample point transactions
  const pointTransactions: PointTransaction[] = [
    {
      id: 1,
      title: 'Register to get points',
      orderId: '996',
      date: '2025-11-11',
      time: '07:11:28',
      pointsBefore: 0,
      pointsAfter: 100,
      pointsChange: 100,
      type: 'earn',
    },
    {
      id: 2,
      title: 'Purchase reward',
      orderId: '1024',
      date: '2024-11-18',
      time: '14:30:15',
      pointsBefore: 100,
      pointsAfter: 150,
      pointsChange: 50,
      type: 'earn',
    },
    {
      id: 3,
      title: 'Used for discount',
      orderId: '1025',
      date: '2024-11-17',
      time: '10:22:45',
      pointsBefore: 150,
      pointsAfter: 120,
      pointsChange: -30,
      type: 'spend',
    },
    {
      id: 4,
      title: 'Daily check-in bonus',
      date: '2024-11-15',
      time: '09:05:12',
      pointsBefore: 120,
      pointsAfter: 130,
      pointsChange: 10,
      type: 'earn',
    },
    {
      id: 5,
      title: 'Referral bonus',
      date: '2024-11-12',
      time: '16:20:33',
      pointsBefore: 130,
      pointsAfter: 180,
      pointsChange: 50,
      type: 'earn',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Point Detail</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Point Transactions List */}
          {pointTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                {transaction.orderId && (
                  <Text style={styles.orderId}>Order ID: {transaction.orderId}</Text>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.pointInfo}>
                  <View style={styles.pointRow}>
                    <Text style={styles.pointLabel}>Before:</Text>
                    <Text style={styles.pointValue}>Point {transaction.pointsBefore}</Text>
                  </View>
                  <View style={styles.pointRow}>
                    <Text style={styles.pointLabel}>After:</Text>
                    <Text style={styles.pointValue}>Point {transaction.pointsAfter}</Text>
                  </View>
                </View>

                <View style={styles.changeContainer}>
                  <Text style={[
                    styles.pointChange,
                    transaction.type === 'earn' ? styles.pointEarned : styles.pointSpent
                  ]}>
                    {transaction.pointsChange > 0 ? '+' : ''}{transaction.pointsChange}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={14} color={COLORS.text.secondary} />
                <Text style={styles.dateTime}>
                  {transaction.date} {transaction.time}
                </Text>
              </View>
            </View>
          ))}
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
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
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
    marginTop: -20,
    gap: SPACING.md,
  },
  transactionCard: {
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
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  transactionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  orderId: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pointInfo: {
    flex: 1,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.xs,
    minWidth: 50,
  },
  pointValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  pointChange: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '700',
  },
  pointEarned: {
    color: '#FF6B6B',
  },
  pointSpent: {
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
});

export default PointDetailScreen;
