import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ShippingService } from '../types';

interface ShippingOption {
  id: string;
  name: string;
  deliveryTime: string;
  activeNum: string;
  order: string;
}

interface ShippingContextType {
  shippingOptions: ShippingOption[];
  setShippingOptions: (options: ShippingOption[]) => void;
  addShippingOption: (option: ShippingOption) => void;
  updateShippingOption: (id: string, updatedOption: ShippingOption) => void;
  removeShippingOption: (id: string) => void;
  resetShippingOptions: () => void;
  // Shipping services
  shippingServices: ShippingService[];
  setShippingServices: (services: ShippingService[]) => void;
  addShippingService: (service: ShippingService) => void;
  updateShippingService: (id: number, updatedService: ShippingService) => void;
  removeShippingService: (id: number) => void;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

interface ShippingProviderProps {
  children: ReactNode;
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({ children }) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);

  const addShippingOption = (option: ShippingOption) => {
    setShippingOptions(prev => [...prev, option]);
  };

  const updateShippingOption = (id: string, updatedOption: ShippingOption) => {
    setShippingOptions(prev => prev.map(option => 
      option.id === id ? updatedOption : option
    ));
  };

  const removeShippingOption = (id: string) => {
    setShippingOptions(prev => prev.filter(option => option.id !== id));
  };

  const resetShippingOptions = () => {
    setShippingOptions([]);
  };

  // Shipping services
  const addShippingService = (service: ShippingService) => {
    setShippingServices(prev => [...prev, service]);
  };

  const updateShippingService = (id: number, updatedService: ShippingService) => {
    setShippingServices(prev => prev.map(service => 
      service.id === id ? updatedService : service
    ));
  };

  const removeShippingService = (id: number) => {
    setShippingServices(prev => prev.filter(service => service.id !== id));
  };

  return (
    <ShippingContext.Provider
      value={{
        shippingOptions,
        setShippingOptions,
        addShippingOption,
        updateShippingOption,
        removeShippingOption,
        resetShippingOptions,
        // Shipping services
        shippingServices,
        setShippingServices,
        addShippingService,
        updateShippingService,
        removeShippingService,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};