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
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';
import { usePlatformStore } from '../../store/platformStore';

type SubCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SubCategory'>;
type SubCategoryScreenRouteProp = RouteProp<RootStackParamList, 'SubCategory'>;

interface SubSubCategory {
  id: string;
  name: string;
}

const SubCategoryScreen: React.FC = () => {
  const navigation = useNavigation<SubCategoryScreenNavigationProp>();
  const route = useRoute<SubCategoryScreenRouteProp>();
  const { categoryName, categoryId } = route.params;
  
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSubSubCategories, setFilteredSubSubCategories] = useState<SubSubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get Zustand store
  const { getCompanyCategories, selectedPlatform } = usePlatformStore();

  // Effect to load subsubcategories from mock data
  useEffect(() => {
    setIsLoading(true);
    const companyCategories = getCompanyCategories();
    
    // Find the category and subcategory to get subsubcategories
    let foundSubSubCategories: SubSubCategory[] = [];
    
    for (const category of companyCategories) {
      if (category.subcategories) {
        const subcategory = category.subcategories.find((sub: any) => sub.id === categoryId);
        if (subcategory && subcategory.subsubcategories) {
          foundSubSubCategories = subcategory.subsubcategories;
          break;
        }
      }
    }
    
    setSubSubCategories(foundSubSubCategories);
    setFilteredSubSubCategories(foundSubSubCategories);
    setIsLoading(false);
  }, [categoryId, selectedPlatform]);

  // Effect to filter subsubcategories based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = subSubCategories.filter(subSubCategory => 
        subSubCategory.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubSubCategories(filtered);
    } else {
      setFilteredSubSubCategories(subSubCategories);
    }
  }, [searchQuery, subSubCategories]);

  const handleSubSubCategorySelect = (subSubCategory: SubSubCategory) => {
    // Navigate to ProductDiscovery with the selected subsubcategory
    navigation.navigate('ProductDiscovery', { 
      subCategoryName: subSubCategory.name
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{categoryName}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={24} color={COLORS.text.primary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
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

  const renderSubSubCategoryItem = (item: SubSubCategory) => {
    // Add safety check for item
    if (!item) {
      console.warn('SubSubCategory item is null or undefined');
      return null;
    }
    
    // Generate a safe key
    const key = item.id || `subsubcategory-${Math.random()}`;
    
    return (
      <TouchableOpacity
        key={key}
        style={styles.categoryItem}
        onPress={() => handleSubSubCategorySelect(item)}
      >
        <View style={styles.categoryItemLeft}>
          <Text style={styles.categoryText}>{item.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    // Show loading indicator
    if (isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!categoryId) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Category ID not provided</Text>
        </View>
      );
    }

    // Ensure filteredSubSubCategories is an array before mapping
    if (!Array.isArray(filteredSubSubCategories)) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No items available</Text>
        </View>
      );
    }
    
    // Filter out any null/undefined items before mapping
    const validSubSubCategories = filteredSubSubCategories.filter(item => {
      if (!item) return false;
      if (!item.name || typeof item.name !== 'string') {
        console.warn('SubSubCategory item missing name:', item);
        return false;
      }
      return true;
    });
    
    if (validSubSubCategories.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No items available for this category</Text>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        {validSubSubCategories.map(renderSubSubCategoryItem)}
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
    color: COLORS.text.secondary,
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

export default SubCategoryScreen;