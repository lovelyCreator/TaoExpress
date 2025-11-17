import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

// type Sub2CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Sub2Category'>;
// type Sub2CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Sub2Category'>;

const Sub2CategoryScreen: React.FC = () => {
  // const navigation = useNavigation<Sub2CategoryScreenNavigationProp>();
  // const route = useRoute<Sub2CategoryScreenRouteProp>();
  // const { subCategoryName } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');

  const sub2Categories = [
    { id: '1', name: 'Sling bag', icon: 'bag-outline' as keyof typeof Ionicons.glyphMap },
    { id: '2', name: 'Tote bag', icon: 'bag-outline' as keyof typeof Ionicons.glyphMap },
    { id: '3', name: 'Backpack', icon: 'bag-outline' as keyof typeof Ionicons.glyphMap },
    { id: '4', name: 'Clutch', icon: 'bag-outline' as keyof typeof Ionicons.glyphMap },
    { id: '5', name: 'Wallet', icon: 'bag-outline' as keyof typeof Ionicons.glyphMap },
  ];

  const handleSub2CategorySelect = (sub2CategoryName: string) => {
    // Navigate back to AddProductScreen with the selected category
    // navigation.navigate('AddProduct', { selectedCategory: sub2CategoryName });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        // onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Sub2 Category</Text>
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

  const renderSub2CategoryItem = (item: { id: string; name: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.categoryItem}
      onPress={() => handleSub2CategorySelect(item.name)}
    >
      <View style={styles.categoryItemLeft}>
        {/* <View style={styles.categoryIcon}>
          <Ionicons name={item.icon} size={20} color={COLORS.text.primary} />
        </View> */}
        <Text style={styles.categoryText}>{item.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSearchBar()}
        
        <View style={styles.categoriesContainer}>
          {sub2Categories.map(renderSub2CategoryItem)}
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
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryText: {
    fontSize: FONTS.sizes.smmd,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default Sub2CategoryScreen;