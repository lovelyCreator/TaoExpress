import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, SPACING } from '../../constants';
import {
  Header,
  ProductCard,
  SortModal,
  FilterModal,
  SubFilterModal,
  SearchInput,
  FilterItem,
  QuantitySelector,
  EmptyState,
  LoadingSpinner,
  ActionButton,
  TabBar,
  StoreCard,
} from '../../components';
import { Product, Seller } from '../../types';

const ComponentDemoScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State for various components
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popularity');
  const [quantity, setQuantity] = useState(1);
  const [activeTabId, setActiveTabId] = useState('woman');
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Adidas', 'Nike']);
  
  // Mock data
  const mockProduct: Product = {
    id: '1',
    name: 'Asics Gel-Nunobiki trainers in white and silver',
    description: 'Comfortable and stylish sneakers for everyday wear',
    price: 182.00,
    originalPrice: 192.00,
    discountPercentage: 10,
    images: ['https://example.com/image1.jpg'],
    category: {
      id: '1',
      name: 'Shoes',
      icon: 'shoe',
      image: 'https://example.com/category.jpg',
      subcategories: ['Sneakers', 'Boots'],
    },
    subcategory: 'Sneakers',
    brand: 'Asics',
    seller: {
      id: '1',
      name: 'Roland Ausie Aron',
      avatar: 'https://example.com/avatar.jpg',
      rating: 4.8,
      reviewCount: 59,
      isVerified: true,
      followersCount: 1000,
      description: 'Official store',
      location: 'Sydney, Australia',
      joinedDate: new Date(),
    },
    rating: 5,
    reviewCount: 59,
    inStock: true,
    stockCount: 100,
    tags: ['popular', 'new'],
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 0
  };
  
  const mockStore: Seller = {
    id: '1',
    name: 'Roland Ausie Aron',
    avatar: 'https://example.com/avatar.jpg',
    rating: 4.8,
    reviewCount: 59,
    isVerified: true,
    followersCount: 1000,
    description: 'Official store',
    location: 'Sydney, Australia',
    joinedDate: new Date(),
  };
  
  const sortOptions = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'Price High to Low', value: 'price_high' },
    { label: 'Price Low to High', value: 'price_low' },
    { label: 'Newest', value: 'newest' },
  ];
  
  const filterOptions = [
    { label: 'Brand', value: 'brand', selectedCount: selectedBrands.length },
    { label: 'Category', value: 'category' },
    { label: 'Size', value: 'size' },
    { label: 'Price', value: 'price' },
  ];
  
  const allBrands = ['Adidas', 'Nike', 'Puma', 'Reebok', 'New Balance'];
  
  const tabs = [
    { id: 'woman', label: 'Woman' },
    { id: 'man', label: 'Man' },
    { id: 'sports', label: 'Sports' },
    { id: 'kids', label: 'Kids' },
    { id: 'luxury', label: 'Luxury' },
  ];
  
  const handleProductPress = () => {
    Alert.alert('Product Pressed', 'Product card was pressed');
  };
  
  const handleLikePress = () => {
    Alert.alert('Like Pressed', 'Like button was pressed');
  };
  
  const handleFilterOptionPress = (value: string) => {
    if (value === 'brand') {
      setBrandModalVisible(true);
    }
    setFilterModalVisible(false);
  };
  
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };
  
  return (
    <View style={styles.container}>
      <Header
        title="Component Demo"
        showBackButton={true}
        rightIcons={[
          { icon: 'search-outline', onPress: () => Alert.alert('Search', 'Search icon pressed') },
          { icon: 'heart-outline', onPress: () => Alert.alert('Wishlist', 'Wishlist icon pressed'), badgeCount: 3 },
        ]}
      />
      
      <ScrollView style={styles.content}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabPress={setActiveTabId}
          style={styles.tabBar}
        />
        
        <View style={styles.section}>
          <ActionButton
            title="Primary Button"
            onPress={() => Alert.alert('Button', 'Primary button pressed')}
            variant="primary"
            style={styles.button}
          />
          
          <ActionButton
            title="Secondary Button"
            onPress={() => Alert.alert('Button', 'Secondary button pressed')}
            variant="secondary"
            style={styles.button}
          />
          
          <ActionButton
            title="Outline Button"
            onPress={() => Alert.alert('Button', 'Outline button pressed')}
            variant="outline"
            style={styles.button}
          />
          
          <ActionButton
            title="Danger Button"
            onPress={() => Alert.alert('Button', 'Danger button pressed')}
            variant="danger"
            style={styles.button}
          />
        </View>
        
        <View style={styles.section}>
          <QuantitySelector
            quantity={quantity}
            onIncrement={() => setQuantity(q => q + 1)}
            onDecrement={() => setQuantity(q => Math.max(1, q - 1))}
            minQuantity={1}
            maxQuantity={10}
            style={styles.quantitySelector}
          />
        </View>
        
        <View style={styles.section}>
          <ProductCard
            product={mockProduct}
            onPress={handleProductPress}
            onLikePress={handleLikePress}
            isLiked={false}
            style={styles.productCard}
          />
        </View>
        
        <View style={styles.section}>
          <StoreCard
            store={mockStore}
            onPress={() => Alert.alert('Store', 'Store card pressed')}
            style={styles.storeCard}
          />
        </View>
        
        <View style={styles.section}>
          <EmptyState
            title="Empty State"
            subtitle="This is an example of an empty state component"
            buttonTitle="Action Button"
            onButtonPress={() => Alert.alert('Empty State', 'Action button pressed')}
          />
        </View>
      </ScrollView>
      
      {/* Modals */}
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onSelect={setSelectedSort}
        selectedValue={selectedSort}
        options={sortOptions}
      />
      
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={() => Alert.alert('Filter', 'Filters applied')}
        onClear={() => setSelectedBrands([])}
        filterOptions={filterOptions}
        onFilterOptionPress={handleFilterOptionPress}
      />
      
      <SubFilterModal
        visible={brandModalVisible}
        onClose={() => setBrandModalVisible(false)}
        onApply={() => {}}
        onClear={() => setSelectedBrands([])}
        title="Brand"
      >
        <View>
          <SearchInput
            value={brandSearch}
            onChangeText={setBrandSearch}
            placeholder="Search brands"
          />
          {allBrands
            .filter(brand => brand.toLowerCase().includes(brandSearch.toLowerCase()))
            .map(brand => (
              <FilterItem
                key={brand}
                label={brand}
                selected={selectedBrands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
        </View>
      </SubFilterModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  tabBar: {
    marginBottom: SPACING.md,
  },
  button: {
    marginBottom: SPACING.md,
  },
  quantitySelector: {
    alignSelf: 'flex-start',
  },
  productCard: {
    width: '100%',
  },
  storeCard: {
    width: '100%',
  },
});

export default ComponentDemoScreen;