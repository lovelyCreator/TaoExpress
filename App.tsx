import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ToastProvider } from './src/context/ToastContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ProductProvider } from './src/context/ProductContext';
import { VariationProvider } from './src/context/VariationContext';
import { ShippingProvider } from './src/context/ShippingContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { SearchProvider } from './src/context/SearchContext';
import { ForYouProvider } from './src/context/ForYouContext';
import { ErrorBoundary } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from './src/components/Toast';
import { useToast } from './src/context/ToastContext';
import { COLORS } from './src/constants';
import { Provider } from 'react-redux';
import { store } from './src/store';

// Component that renders the main app content with toast
const AppWithToast = () => {
  const { toast, hideToast } = useToast();
  
  return (
    <>
      <StatusBar style="auto" hidden={true} backgroundColor={COLORS.primary} />
      <AppNavigator />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
          <Provider store={store}>
            <AuthProvider>
              <ToastProvider>
                <CartProvider>
                  <WishlistProvider>
                    <ProductProvider>
                      <VariationProvider>
                        <ShippingProvider>
                          <CategoryProvider>
                            <SearchProvider>
                              <ForYouProvider>
                                <AppWithToast />
                              </ForYouProvider>
                            </SearchProvider>
                          </CategoryProvider>
                        </ShippingProvider>
                      </VariationProvider>
                    </ProductProvider>
                  </WishlistProvider>
                </CartProvider>
              </ToastProvider>
            </AuthProvider>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}