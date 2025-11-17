import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VariationData } from '../types';

interface VariationContextType {
  variations: VariationData;
  setVariations: (variations: VariationData) => void;
  addVariation: (variation: any) => void;
  updateVariation: (id: string, variation: any) => void;
  removeVariation: (id: string) => void;
  resetVariations: () => void;
}

const VariationContext = createContext<VariationContextType | undefined>(undefined);

interface VariationProviderProps {
  children: ReactNode;
}

export const VariationProvider: React.FC<VariationProviderProps> = ({ children }) => {
  const [variations, setVariations] = useState<VariationData>([]);

  const addVariation = (variation: any) => {
    setVariations(prev => [...prev, variation]);
  };

  const updateVariation = (id: string, updatedVariation: any) => {
    setVariations(prev => prev.map(variation => 
      variation.name === id ? updatedVariation : variation
    ));
  };

  const removeVariation = (id: string) => {
    setVariations(prev => prev.filter(variation => variation.name !== id));
  };

  const resetVariations = () => {
    setVariations([]);
  };

  return (
    <VariationContext.Provider
      value={{
        variations,
        setVariations,
        addVariation,
        updateVariation,
        removeVariation,
        resetVariations,
      }}
    >
      {children}
    </VariationContext.Provider>
  );
};

export const useVariations = () => {
  const context = useContext(VariationContext);
  if (context === undefined) {
    throw new Error('useVariations must be used within a VariationProvider');
  }
  return context;
};