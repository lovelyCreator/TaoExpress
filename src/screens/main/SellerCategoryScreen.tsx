import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useCategoriesMutation } from '../../hooks/useCategories';
import { CategoryData } from '../../hooks/useCategories';

type SellerCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SellerCategory'>;

const SellerCategoryScreen: React.FC = () => {
  const navigation = useNavigation<SellerCategoryScreenNavigationProp>();
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  // Ref to track if data has already been fetched to prevent redundant API calls
  const hasFetchedData = useRef(false);

  // Initialize the category mutation hook for fetching categories from backend
  const { mutate: fetchCategories, data, isLoading, error } = useCategoriesMutation({
    // Success callback when categories are fetched successfully
    onSuccess: (data) => {
      // Ensure data is an array before setting categories
      if (Array.isArray(data)) {
        setCategories(data);
        setFilteredCategories(data); // Initially show all categories
      } else {
        setCategories([]);
        setFilteredCategories([]);
      }
      // Mark that we've successfully fetched data
      hasFetchedData.current = true;
    },
    // Error callback when category fetching fails
    onError: (error) => {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set to empty array on error
      setFilteredCategories([]); // Set to empty array on error
      // Mark that we've attempted to fetch data (even if it failed)
      hasFetchedData.current = true;
    }
  });

  // Effect to fetch categories only once when component mounts
  useEffect(() => {
    // Only fetch data if we haven't fetched it yet
    if (!hasFetchedData.current) {
      fetchCategories();
    }
  }, [fetchCategories]);

  // Effect to filter categories based on search query
  // This filters the already fetched categories locally without API calls
  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleCategorySelect = (category: CategoryData) => {
    // Navigate to SubCategoryScreen with the selected category
    navigation.navigate('SubCategory', { categoryName: category.name, categoryId: category.id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Category</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={24} color={COLORS.text.primary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search category"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.gray[400]}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategoryItem = (item: CategoryData) => {
    // Add safety check for item
    if (!item) {
      console.warn('Category item is null or undefined');
      return null;
    }
    
    // Generate a safe key
    const key = item.id ? item.id.toString() : `category-${Math.random()}`;
    
    return (
      <TouchableOpacity
        key={key}
        style={styles.categoryItem}
        onPress={() => handleCategorySelect(item)}
      >
        <View style={styles.categoryItemLeft}>
          <Text style={styles.categoryText}>{item.name || 'Unnamed Category'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.primary} />
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    // Show loading indicator only before data is fetched
    if (isLoading && !hasFetchedData.current) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      );
    }

    // Show error message only before data is fetched
    if (error && !hasFetchedData.current) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            // Reset the fetch status to allow retrying
            hasFetchedData.current = false;
            fetchCategories();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Ensure filteredCategories is an array before mapping
    if (!Array.isArray(filteredCategories)) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No categories available</Text>
        </View>
      );
    }

    // Debug: Log the categories before rendering
    console.log('Rendering categories:', filteredCategories);
    
    // Filter out any null/undefined items before mapping
    const validCategories = filteredCategories.filter(item => {
      // Check if item exists and has valid properties
      if (!item) return false;
      // Check if item has name property
      if (!item.name || typeof item.name !== 'string') {
        console.warn('Category item missing name:', item);
        return false;
      }
      return true;
    });
    
    if (validCategories.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No valid categories available</Text>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        {validCategories.map(renderCategoryItem)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSearchBar()}
        {renderContent()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS['2xl'],
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  categoriesContainer: {
    marginHorizontal: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.smmd,
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
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
});

export default SellerCategoryScreen;