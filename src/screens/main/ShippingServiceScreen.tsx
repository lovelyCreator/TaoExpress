import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, ShippingService } from '../../types';
import { useGetShippingServicesMutation, useDeleteShippingServiceMutation } from '../../hooks/useShippingServices';
import { useShipping } from '../../context/ShippingContext';

type ShippingServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ShippingService'>;

const ShippingServiceScreen: React.FC = () => {
  const navigation = useNavigation<ShippingServiceScreenNavigationProp>();
  const { shippingServices } = useShipping();
  
  // TODO: Get store ID from user context instead of hardcoding
  const storeId = 1; // This should come from user context
  
  const { 
    mutate: fetchShippingServices, 
    isLoading: isFetching, 
    error: fetchError,
    isSuccess 
  } = useGetShippingServicesMutation();
  
  const { 
    mutate: deleteShippingService, 
    isLoading: isDeleting,
    error: deleteError
  } = useDeleteShippingServiceMutation();

  // Fetch shipping services when screen loads
  useEffect(() => {
    fetchShippingServices(storeId);
  }, [fetchShippingServices, storeId]);

  const handleDeleteService = (serviceId: number, serviceName: string) => {
    Alert.alert(
      'Delete Shipping Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteShippingService(serviceId);
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Shipping Service</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddShippingService', { mode: 'add' })}
      >
        <Ionicons name="add" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderServiceItem = (service: ShippingService, index: number) => (
    <View key={service.id} style={styles.serviceItemContainer}>
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => navigation.navigate('AddShippingService', { mode: 'edit', shippingService: service })}
      >
        <View style={styles.serviceContent}>
          <Text style={styles.serviceCode}>ID: {service.id}</Text>
          <Text style={styles.serviceTitle}>{service.service_name}</Text>
          <Text style={styles.serviceDetails}>
            {service.locations?.length || 0} locations • {service.processing_time}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
      </TouchableOpacity>
      {/* <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteService(service.id!, service.service_name)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={COLORS.error} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        )}
      </TouchableOpacity> */}
    </View>
  );

  // Show error if fetch failed
  // useEffect(() => {
  //   if (fetchError) {
  //     Alert.alert('Error', fetchError);
  //   }
  // }, [fetchError]);

  // Show error if delete failed
  useEffect(() => {
    if (deleteError) {
      Alert.alert('Error', deleteError);
    }
  }, [deleteError]);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading shipping services...</Text>
          </View>
        // ) : fetchError ? (
        //   <View style={styles.errorContainer}>
        //     <Text style={styles.errorText}>Error: {fetchError}</Text>
        //     <TouchableOpacity style={styles.retryButton} onPress={() => fetchShippingServices(storeId)}>
        //       <Text style={styles.retryButtonText}>Retry</Text>
        //     </TouchableOpacity>
        //   </View>
        // ) : shippingServices.length === 0 ? (
        //   <View style={styles.emptyContainer}>
        //     <Text style={styles.emptyText}>No shipping services found</Text>
        //     <TouchableOpacity 
        //       style={styles.addButtonLarge}
        //       onPress={() => navigation.navigate('AddShippingService', { mode: 'add' })}
        //     >
        //       <Text style={styles.addButtonText}>Add Shipping Service</Text>
        //     </TouchableOpacity>
        //   </View>
        ) : (
          <View style={styles.servicesSection}>
            {shippingServices.map((service: ShippingService, index: number) => renderServiceItem(service, index))}
          </View>
        )}
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
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  addButtonLarge: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  servicesSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  serviceItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.smmd,
  },
  serviceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.smmd,
  },
  serviceContent: {
    flex: 1,
  },
  serviceCode: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  serviceTitle: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  serviceDetails: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
});

export default ShippingServiceScreen;