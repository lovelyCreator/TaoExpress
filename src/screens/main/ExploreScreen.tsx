import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useCategoriesMutation } from '../../hooks/useCategories';

// Fix: Use 'Explore' since this screen is now properly registered in the navigation stack
type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Explore'>;

const { width } = Dimensions.get('window');
const CATEGORY_ITEM_SIZE = (width - SPACING.lg * 2 - SPACING.sm * 3) / 4;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  // Use the categories mutation hook to fetch categories from backend
  const { mutate: fetchCategories, data: categoriesData, isLoading: isCategoriesLoading, isError } = useCategoriesMutation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate('ProductDiscovery', { subCategoryName: categoryName });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore</Text>
      <Text style={styles.headerSubtitle}>Discover new products and trends</Text>
    </View>
  );

  const renderCategories = () => {
    if (isCategoriesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Filter out invalid categories and ensure we have valid data
    const categoriesToDisplay = (categoriesData && Array.isArray(categoriesData) ? categoriesData : [])
      .filter((item: any) => item && (item.name || item.id));

    // Show empty state if no valid categories
    if (categoriesToDisplay.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No categories available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {categoriesToDisplay.map((category) => (
            <TouchableOpacity
              key={`category-${category.id || category.name || Math.random()}`}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.name || `Category ${category.id}`)}
            >
              <View style={styles.categoryImageContainer}>
                <Image
                  source={category.image_full_url ? { uri: category.image_full_url } : require('../../assets/icons/viewall.png')}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name || `Category ${category.id}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderCategories()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  categoriesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: CATEGORY_ITEM_SIZE,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  categoryImageContainer: {
    width: CATEGORY_ITEM_SIZE,
    height: CATEGORY_ITEM_SIZE,
    marginBottom: SPACING.sm,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ExploreScreen;