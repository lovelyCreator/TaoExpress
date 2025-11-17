import { create } from 'zustand';
import companiesData from '../data/mockCompanies.json';
import mockProductsData from '../data/mockProducts.json';

interface PlatformState {
  selectedPlatform: string;
  selectedCategory: string;
  setSelectedPlatform: (platform: string) => void;
  setSelectedCategory: (category: string) => void;
  getCompanyCategories: () => any[];
  getFilteredProducts: (type: 'newIn' | 'trending' | 'forYou') => any[];
  getRecommendedSubcategories: () => any[];
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  selectedPlatform: '1688',
  selectedCategory: '',
  
  setSelectedPlatform: (platform: string) => {
    set({ selectedPlatform: platform, selectedCategory: '' });
  },
  
  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },
  
  getCompanyCategories: () => {
    const { selectedPlatform } = get();
    const company = companiesData.companies.find(c => c.id === selectedPlatform);
    return company?.categories || [];
  },
  
  getFilteredProducts: (type: 'newIn' | 'trending' | 'forYou') => {
    const { selectedPlatform, selectedCategory } = get();
    const products = mockProductsData[type] as any[];
    
    return products.filter((product: any) => {
      const matchesCompany = product.company === selectedPlatform;
      // Match by category ID
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory;
      return matchesCompany && matchesCategory;
    });
  },
  
  getRecommendedSubcategories: () => {
    const { selectedPlatform, selectedCategory } = get();
    const company = companiesData.companies.find(c => c.id === selectedPlatform);
    
    if (!company) return [];
    
    // If a category is selected, show its subcategories (up to 8)
    if (selectedCategory && selectedCategory !== 'all') {
      const category = company.categories.find(c => c.id === selectedCategory);
      return category?.subcategories?.slice(0, 8) || [];
    }
    
    // Otherwise show first category's subcategories
    const firstCategory = company.categories[0];
    return firstCategory?.subcategories?.slice(0, 8) || [];
  },
}));
