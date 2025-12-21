import { getStoredToken } from './authApi';

const API_BASE_URL = 'https://todaymall.co.kr/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DesignatedShootingItem {
  note: string;
  photo: string;
}

export interface ItemDetails {
  notes?: string;
  designatedShooting?: DesignatedShootingItem[];
}

export interface CreateOrderRequest {
  cartItemIds: string[];
  orderType: 'General' | 'VVIC' | 'Rocket';
  transferMethod: 'air' | 'ship';
  itemDetails: Record<string, ItemDetails>;
  flow: 'general';
  addressId: string;
}

export interface OrderResponse {
  order: {
    _id: string;
    orderNumber: string;
    user: string;
    items: any[];
    addressId: string;
    shippingAddress: any;
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrderItem {
  id: string;
  offerId: string;
  specId: string;
  skuId: string;
  categoryId: string;
  subject: string;
  subjectTrans: string;
  imageUrl: string;
  promotionUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
  skuAttributes: Array<{
    attributeId: number;
    attributeName: string;
    attributeNameTrans: string;
    value: string;
    valueTrans: string;
    skuImageUrl?: string;
  }>;
  companyName: string;
  sellerOpenId: string;
  notes?: string;
  designatedShooting?: DesignatedShootingItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  progressStatus: string;
  orderStatus: string;
  shippingStatus: string;
  warehouseStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: {
    recipient: string;
    contact: string;
    customerClearanceType: string;
    personalCustomsCode: string;
    detailedAddress: string;
    zipCode: string;
    note?: string;
  };
  transferMethod: string;
  warehouseCode: string;
  childOrders: any[];
  isParentOrder: boolean;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    changedBy?: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const orderApi = {
  getOrders: async (page: number = 1, pageSize: number = 10): Promise<ApiResponse<GetOrdersResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/orders?page=${page}&pageSize=${pageSize}`;
      console.log('Sending get orders request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('Get orders response status:', response.status);

      const responseText = await response.text();
      console.log('Get orders response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to get orders',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Orders retrieved successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      console.error('Get orders error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  createOrder: async (request: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const token = await getStoredToken();

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      const url = `${API_BASE_URL}/orders`;
      console.log('Sending create order request to:', url);
      console.log('Create order request body:', JSON.stringify(request, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(request),
      });

      console.log('Create order response status:', response.status);

      const responseText = await response.text();
      console.log('Create order response text:', responseText.substring(0, 500));

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error: 'Invalid response from server. Please try again.',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData?.message || `Request failed with status ${response.status}`,
        };
      }

      if (responseData.status !== 'success') {
        return {
          success: false,
          error: responseData?.message || 'Failed to create order',
        };
      }

      return {
        success: true,
        message: responseData.message || 'Order created successfully',
        data: responseData.data,
      };
    } catch (error: any) {
      console.error('Create order error:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

