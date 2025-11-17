import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  selectedFilters: {
    brands: string[];
    categories: string[];
    sizes: string[];
    priceRanges: string[];
    ratings: string[];
  };
  setSelectedFilters: (filters: {
    brands: string[];
    categories: string[];
    sizes: string[];
    priceRanges: string[];
    ratings: string[];
  }) => void;
  resetSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('Popularity');
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [] as string[],
    categories: [] as string[],
    sizes: [] as string[],
    priceRanges: [] as string[],
    ratings: [] as string[],
  });

  const resetSearch = () => {
    setSearchQuery('');
    setSelectedSort('Popularity');
    setSelectedFilters({
      brands: [],
      categories: [],
      sizes: [],
      priceRanges: [],
      ratings: [],
    });
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedSort,
        setSelectedSort,
        selectedFilters,
        setSelectedFilters,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};