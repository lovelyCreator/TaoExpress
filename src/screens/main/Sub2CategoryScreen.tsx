import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';
import { usePlatformStore } from '../../store/platformStore';

const { width } = Dimensions.get('window');

type Sub2CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Sub2Category'>;
type Sub2CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Sub2Category'>;

const Sub2CategoryScreen: React.FC = () => {
  const navigation = useNavigation<Sub2CategoryScreenNavigationProp>();
  const route = useRoute<Sub2CategoryScreenRouteProp>();
  const { 
    subCategoryName, 
    categoryId, 
    subcategoryId, 
    categoryName,
    subsubcategories = []
  } = route.params;
  
  // Get selectedPlatform from Zustand store
  const { selectedPlatform } = usePlatformStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use subsubcategories from route params, or fallback to empty array
  const sub2Categories = subsubcategories.length > 0 
    ? subsubcategories.map((item: any) => ({
        id: item.id || item._id || '',
        name: typeof item.name === 'object' 
          ? (item.name.en || item.name.zh || item.name.ko || '')
          : (item.name || ''),
        image: item.image || undefined,
      }))
    : [];

  const [filteredCategories, setFilteredCategories] = useState(sub2Categories);

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = sub2Categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(sub2Categories);
    }
  }, [searchQuery, subsubcategories]);

  const handleSub2CategorySelect = (sub2Category: { id: string; name: string; image?: string }) => {
    // Navigate to ProductDiscovery with the selected sub2category
    navigation.navigate('ProductDiscovery', {
      subCategoryName: sub2Category.name,
      categoryId: categoryId?.toString(),
      categoryName: categoryName,
      subcategoryId: subcategoryId?.toString(),
      subsubcategories: [],
      source: selectedPlatform, // Pass the current platform
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
      <Text style={styles.headerTitle}>{subCategoryName || 'Sub2 Category'}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={24} color={COLORS.text.primary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search sub category"
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

  const renderSub2CategoryItem = (item: { id: string; name: string; image?: string }, index: number) => {
    // Add safety check for item
    if (!item) {
      console.warn('Sub2Category item is null or undefined');
      return null;
    }
    
    // Generate a safe key
    const key = item.id || `sub2cat-${index}`;
    
    // Check if this is the last item in a row (every 3rd item, or last item overall)
    const isLastInRow = (index + 1) % 3 === 0;
    const itemStyle = isLastInRow 
      ? [styles.quickCategoryItem, { marginRight: 0 }]
      : styles.quickCategoryItem;
    
    return (
      <TouchableOpacity
        key={key}
        style={itemStyle}
        onPress={() => handleSub2CategorySelect(item)}
      >
        <View style={styles.quickCategoryImageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.quickCategoryImage}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={require('../../assets/icons/logo.png')} 
              style={styles.quickCategoryLogo}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.quickCategoryName} numberOfLines={2}>{item.name}</Text>
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

    // Ensure filteredCategories is an array before mapping
    if (!Array.isArray(filteredCategories)) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No items available</Text>
        </View>
      );
    }
    
    // Filter out any null/undefined items before mapping
    const validCategories = filteredCategories.filter(item => {
      if (!item) return false;
      if (!item.name || typeof item.name !== 'string') {
        console.warn('Sub2Category item missing name:', item);
        return false;
      }
      return true;
    });
    
    if (validCategories.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>No items available for this category</Text>
        </View>
      );
    }

    return (
      <View style={styles.quickCategoriesContainer}>
        <View style={styles.quickCategoriesGrid}>
          {validCategories.map((item, index) => renderSub2CategoryItem(item, index))}
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS['2xl'],
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    // paddingVertical: 8,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  quickCategoriesContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
  },
  quickCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  quickCategoryItem: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 3,
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginRight: SPACING.sm,
  },
  quickCategoryImageContainer: {
    width: (width - SPACING.md * 2 - SPACING.sm * 2) / 3,
    height: (width - SPACING.md * 2 - SPACING.sm * 2) / 3,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  quickCategoryImage: {
    width: '100%',
    height: '100%',
  },
  quickCategoryLogo: {
    width: '80%',
    height: '55%',
  },
  quickCategoryName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
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
});

export default Sub2CategoryScreen;