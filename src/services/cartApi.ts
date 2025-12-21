import axios from 'axios';
import { getStoredToken } from './authApi';

const API_BASE_URL = 'https://todaymall.co.kr/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AddToCartRequest {
  offerId: number;
  categoryId: number;
  subject: string;
  subjectTrans: string;
  imageUrl: string;
  promotionUrl?: string;
  skuInfo: {
    skuId: number;
    specId: string;
    price: string;
    amountOnSale: number;
    consignPrice: string;
    cargoNumber?: string;
    skuAttributes: Array<{
      attributeId: number;
      attributeName: string;
      attributeNameTrans: string;
      value: string;
      valueTrans: string;
      skuImageUrl?: string;
    }>;
    fenxiaoPriceInfo?: {
      offerPrice: string;
    };
  };
  companyName: string;
  sellerOpenId: string;
  quantity: number;
}

export interface CartItem {
  offerId: number;
  categoryId: number;
  subject: string;
  subjectTrans: string;
  imageUrl: string;
  promotionUrl?: string;
  skuInfo: {
    skuId: number;
    specId: string;
    price: string;
    amountOnSale: number;
    consignPrice: string;
    cargoNumber?: string;
    skuAttributes: Array<{
      attributeId: number;
      attributeName: string;
      attributeNameTrans: string;
      value: string;
      valueTrans: string;
      skuImageUrl?: string;
    }>;
    fenxiaoPriceInfo?: {
      offerPrice: string;
    };
  };
  companyName: string;
  sellerOpenId: string;
  quantity: number;
  addedAt?: string;
  _id?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export const cartApi = {
  // Get cart
  getCart: async (): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart`;
      console.log('Sending get cart request to:', url);

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Get cart response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Cart retrieved successfully',
      };
    } catch (error: any) {
      console.error('Get cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get cart';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Add product to cart
  addToCart: async (request: AddToCartRequest): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart`;
      console.log('Sending add to cart request to:', url);
      console.log('Add to cart request body:', JSON.stringify(request, null, 2));

      const response = await axios.post(url, request, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Add to cart response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Product added to cart successfully',
      };
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product to cart';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId: string, quantity: number): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart/${cartItemId}`;
      console.log('Sending update cart item request to:', url);
      console.log('Update cart item body:', JSON.stringify({ quantity }, null, 2));

      const response = await axios.put(url, { quantity }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Update cart item response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cart item updated successfully',
      };
    } catch (error: any) {
      console.error('Update cart item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Delete cart item
  deleteCartItem: async (cartItemId: string): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart/${cartItemId}`;
      console.log('Sending delete cart item request to:', url);

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete cart item response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cart item deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete cart item error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete cart item';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Clear cart (delete all items)
  clearCart: async (): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart`;
      console.log('Sending clear cart request to:', url);

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Clear cart response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cart cleared successfully',
      };
    } catch (error: any) {
      console.error('Clear cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },

  // Delete batch cart items
  deleteCartBatch: async (cartItemIds: string[]): Promise<ApiResponse<{ cart: Cart }>> => {
    try {
      const token = await getStoredToken();

      const url = `${API_BASE_URL}/cart`;
      console.log('Sending delete batch cart items request to:', url);
      console.log('Delete batch body:', JSON.stringify({ itemIds: cartItemIds }, null, 2));

      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { itemIds: cartItemIds },
      });

      console.log('Delete batch cart items response:', response.data);

      if (!response.data || !response.data.data) {
        return {
          success: false,
          message: 'No cart data received',
          data: undefined,
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cart items deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete batch cart items error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete cart items';
      return {
        success: false,
        message: errorMessage,
        data: undefined,
      };
    }
  },
};

