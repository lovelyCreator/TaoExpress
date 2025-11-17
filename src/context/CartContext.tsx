import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { Cart, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { 
  useGetCartMutation, 
  useAddToCartMutation, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation 
} from '../hooks/useCartMutations';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  stores?: any[];
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number, variationId?: number, optionId?: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number, variation: number, option: number) => Promise<void>;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  calculateTotals: () => void;
  clearError: () => void;
  refetchCart: () => void;
  isAddToCartLoading: boolean;
  isUpdateCartItemLoading: boolean;
  isRemoveFromCartLoading: boolean;
}

type CartAction =
  | { type: 'CART_START' }
  | { type: 'CART_SET_ITEMS'; payload: any[] }
  | { type: 'CART_CLEAR' }
  | { type: 'CART_APPLY_PROMO'; payload: { code: string; discount: number } }
  | { type: 'CART_REMOVE_PROMO' }
  | { type: 'CART_CALCULATE_TOTALS' }
  | { type: 'CART_FAILURE'; payload: string }
  | { type: 'CART_CLEAR_ERROR' };

const initialCart: Cart = {
  items: [],
  total: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
};

const initialState: CartState = {
  cart: initialCart,
  isLoading: false,
  error: null,
  stores: [],
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_START':
      return { ...state, isLoading: true, error: null };
    case 'CART_SET_ITEMS': {
      const payload = Array.isArray(action.payload) ? action.payload : [];
      const stores = payload;

      const items: CartItem[] = payload.flatMap((store: any) => {
        const carts = Array.isArray(store.carts) ? store.carts : [];
        return carts.map((cartItem: any) => ({
          id: cartItem.id?.toString() || '0',
          userId: cartItem.user_id?.toString() || '1',
          product: {
            id: cartItem.item_id?.toString() || '0',
            name: cartItem.item_name || 'Unknown Item',
            price: cartItem.price || 0,
            images: [cartItem.item_image || ''],
          },
          quantity: cartItem.quantity || 1,
          price: cartItem.price || 0,
        }));
      });

      return {
        ...state,
        cart: { ...state.cart, items },
        stores,
        isLoading: false,
      };
    }
    case 'CART_CLEAR':
      return { ...state, cart: initialCart, isLoading: false };
    case 'CART_APPLY_PROMO':
      return {
        ...state,
        cart: { ...state.cart, promoCode: action.payload.code, discount: action.payload.discount },
      };
    case 'CART_REMOVE_PROMO':
      return { ...state, cart: { ...state.cart, promoCode: undefined, discount: 0 } };
    case 'CART_CALCULATE_TOTALS': {
      const subtotal = state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.08;
      const shipping = subtotal > 50 ? 0 : 9.99;
      const total = subtotal + tax + shipping - state.cart.discount;
      return { ...state, cart: { ...state.cart, subtotal, tax, shipping, total: Math.max(0, total) } };
    }
    case 'CART_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'CART_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.warn('useCart must be used within a CartProvider.');
    return {
      cart: initialCart,
      stores: [],
      isLoading: false,
      error: null,
      isAddToCartLoading: false,
      isUpdateCartItemLoading: false,
      isRemoveFromCartLoading: false,
      addToCart: async () => {},
      removeFromCart: async () => {},
      updateQuantity: async () => {},
      clearCart: () => {},
      applyPromoCode: async () => false,
      removePromoCode: () => {},
      calculateTotals: () => {},
      clearError: () => {},
      refetchCart: () => {},
    };
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const isFetchingRef = useRef(false);

  const { mutate: fetchCart, data: cartData, isLoading: isCartLoading } = useGetCartMutation();
  const { mutate: addToCartMutation, isLoading: isAddToCartLoading } = useAddToCartMutation();
  const { mutate: updateCartItemMutation, isLoading: isUpdateCartItemLoading } = useUpdateCartItemMutation();
  const { mutate: removeFromCartMutation, isLoading: isRemoveFromCartLoading } = useRemoveFromCartMutation();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      refetchCart();
    } else if (!authLoading && !isAuthenticated) {
      dispatch({ type: 'CART_CLEAR' });
    }
  }, [user?.id, isAuthenticated, authLoading]);

  useEffect(() => {
    if (cartData) {
      dispatch({ type: 'CART_SET_ITEMS', payload: cartData });
    }
  }, [cartData]);

  const refetchCart = useCallback(() => {
    if (isCartLoading || isFetchingRef.current) return;
    isFetchingRef.current = true;
    fetchCart().finally(() => (isFetchingRef.current = false));
  }, [fetchCart, isCartLoading]);

  // ✅ Simplified version — direct use of addToCartMutation
  const addToCart = async (product: Product, quantity: number = 1, variationId?: number, optionId?: number) => {
    if (!product?.id) throw new Error('Invalid product');
    try {
      await addToCartMutation({
        itemId: Number(product.id),
        quantity,
        variation: variationId || 0,
        option: optionId || 0,
      });
      refetchCart();
    } catch (err: any) {
      console.error('Add to Cart failed:', err);
      dispatch({ type: 'CART_FAILURE', payload: 'Failed to add to cart' });
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await removeFromCartMutation({ cartId });
      refetchCart();
    } catch {
      dispatch({ type: 'CART_FAILURE', payload: 'Failed to remove from cart' });
    }
  };

  const updateQuantity = async (cartId: number, quantity: number, variation: number, option: number) => {
    try {
      if (quantity <= 0) return removeFromCart(cartId);
      await updateCartItemMutation({ cartId, quantity, variation, option });
      refetchCart();
    } catch {
      dispatch({ type: 'CART_FAILURE', payload: 'Failed to update quantity' });
    }
  };

  const clearCart = () => dispatch({ type: 'CART_CLEAR' });

  const applyPromoCode = async (code: string) => {
    const promoCodes: Record<string, number> = { WELCOME10: 10, SAVE20: 20 };
    const discount = promoCodes[code.toUpperCase()];
    if (discount) {
      dispatch({ type: 'CART_APPLY_PROMO', payload: { code, discount } });
      return true;
    }
    dispatch({ type: 'CART_FAILURE', payload: 'Invalid promo code' });
    return false;
  };

  const removePromoCode = () => dispatch({ type: 'CART_REMOVE_PROMO' });
  const calculateTotals = () => dispatch({ type: 'CART_CALCULATE_TOTALS' });
  const clearError = () => dispatch({ type: 'CART_CLEAR_ERROR' });

  const value: CartContextType = {
    ...state,
    isLoading: state.isLoading || isCartLoading || isAddToCartLoading || isUpdateCartItemLoading || isRemoveFromCartLoading,
    isAddToCartLoading,
    isUpdateCartItemLoading,
    isRemoveFromCartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromoCode,
    calculateTotals,
    clearError,
    refetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
