import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList, Product, Category } from '../types';
import { useAppSelector } from '../store/hooks';
import { translations } from '../i18n/translations';
import { getProducts } from '../services/localDatabase';
import { useCategoriesMutation } from '../hooks/useCategories';

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;
type CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;

const { width } = Dimensions.get('window');
const CategoryScreen: React.FC = () => {
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const { categoryId } = route.params;
  const locale = useAppSelector((state) => state.i18n.locale);
  const t = (key: string) => {
    const dict: any = (translations as any)[locale] || (translations as any).en;
    const val = key.split('.').reduce((o: any, k: string) => (o && o[k] !== undefined ? o[k] : undefined), dict);
    if (val !== undefined) return String(val);
    const fallback = key.split('.').reduce((o: any, k: string) => (o && o[k] !== undefined ? o[k] : undefined), (translations as any).en);
    return fallback !== undefined ? String(fallback) : key;
  };
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest'>('relevance');

  // Use the categories mutation hook to fetch categories from backend
  const { mutate: fetchCategories, data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesMutation();

  useEffect(() => {
    loadCategoryData();
    // Fetch categories from backend
    fetchCategories();
  }, [categoryId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, productsResponse] = await Promise.all([
        // We're now using the hook for categories, but still need products
        new Promise((resolve) => resolve({ data: [] })), // Placeholder since we're using the hook
        getProducts(1, 20, { category: categoryId, sortBy })
      ]);
      
      // We'll get the category from the hook data instead
      // const category = categoriesResponse.data.find(c => c.id === categoryId);
      // if (category) {
      //   setCategory(category);
      // }
      
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.searchButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {categoryId}
      </Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search' as never)}
        activeOpacity={0.9}
      >
        <Ionicons name="search" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderQuickCategories = () => {
    // Use categories from the hook data
    const categoriesToDisplay = categoriesData && Array.isArray(categoriesData) ? categoriesData : [];
    
    // If still loading categories, show a loading indicator
    if (isCategoriesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('loading.categories')}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.quickCategoriesContainer}>
        <View style={styles.quickCategoriesGrid}>
          {categoriesToDisplay.map((category, index) => (
            <TouchableOpacity 
              key={`quick-category-${category.id}`} 
              style={styles.quickCategoryItem}
              onPress={() => navigation.navigate('ProductDiscovery', { subCategoryName: category.name })}
            >
              {/* Use category image from backend if available, otherwise use a placeholder */}
              <Image 
                // source={category.image ? { uri: category.image } : require('../assets/icons/viewall.png')}
                style={styles.quickCategoryImage}
                resizeMode="cover"
              />
              <Text style={styles.quickCategoryName} numberOfLines={2}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderQuickCategories()}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
  },
  searchButton: {
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
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCategoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
  },
  quickCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  quickCategoryItem: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 4) / 5,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickCategoryImage: {
    width: (width - SPACING.md * 2 - SPACING.sm * 4) / 5,
    height: (width - SPACING.md * 2 - SPACING.sm * 4) / 5,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  quickCategoryName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default CategoryScreen;
