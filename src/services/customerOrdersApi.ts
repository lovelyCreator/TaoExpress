import { 
  ApiResponse, 
  CustomerOrderDetails,
  CustomerOrderResponse
} from '../types';
import { getStoredToken } from './authApi';
import axios from 'axios';

// API base URL - using environment variable with fallback to local endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://todaymall.co.kr/api/v1';

// Customer Orders API
export const customerOrdersApi = {
  // Get customer orders with pagination and status filter
  getCustomerOrders: async (
    limit: number = 13,
    offset: number = 1,
    status: string = 'all'
  ): Promise<ApiResponse<CustomerOrderResponse>> => {
    try {
      const token = await getStoredToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        status: status
      });
      console.log("Get Customer Orders Params: ", params.toString());
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/customer/order/list?${params.toString()}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          orders: [],
          total_size: 0,
        }
      };
      const response = { data: mockResponse.data };
      console.log("Get Customer Orders Response (MOCK): ", response.data);
      
      return {
        success: true,
        data: {
          ...response.data,
          limit: limit.toString(),
          offset: offset.toString(),
        },
      };
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer orders',
        data: null as any,
      };
    }
  },

  getSellerOrders: async (
    store_id: string = "1",
    limit: number = 13,
    offset: number = 1,
    status: string = 'all'
  ): Promise<ApiResponse<CustomerOrderResponse>> => {
    try {
      const token = await getStoredToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        store_id: store_id,
        limit: limit.toString(),
        offset: offset.toString(),
        status: status
      });
      console.log("Get Customer Orders Params: ", params.toString());
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/vendor/order?${params.toString()}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          orders: [],
          total_size: 0,
        }
      };
      const response = { data: mockResponse.data };
      console.log("Get Customer Orders Response (MOCK): ", response.data);
      
      return {
        success: true,
        data: {
          ...response.data,
          limit: limit.toString(),
          offset: offset.toString(),
        },
      };
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer orders',
        data: null as any,
      };
    }
  },

  // Get customer order by ID
  getCustomerOrderById: async (
    orderId: number
  ): Promise<ApiResponse<CustomerOrderDetails>> => {
    try {
      const token = await getStoredToken();
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/customer/order/details/${orderId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          order_id: orderId,
          user_id: 1,
          order_amount: 0,
          coupon_discount_amount: 0,
          discount_amount: 0,
          coupon_code: null,
          discount_type: null,
          payment_status: 'pending',
          order_status: 'pending',
          payment_method: 'cash',
          transaction_reference: null,
          delivery_address_id: null,
          delivery_charge: 0,
          order_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivery_address: null,
          customer: null,
          details: [],
          delivery_man: null,
          time_slot: null,
          extra_packaging_amount: 0,
          free_delivery_by: null,
          free_delivery_amount: 0,
          order_type: 'delivery',
          store: null,
          schedule_at: null,
          callback: null,
          otp: null,
          pending: null,
          accepted: null,
          confirmed: null,
          processing: null,
          handover: null,
          picked_up: null,
          delivered: null,
          canceled: null,
          refund_requested: null,
          refunded: null,
          delivery_address_data: null,
          delivery_man_data: null,
          time_slot_data: null,
          extra_packaging_amount_data: null,
          free_delivery_by_data: null,
          free_delivery_amount_data: null,
          order_type_data: null,
          store_data: null,
          schedule_at_data: null,
          callback_data: null,
          otp_data: null,
          pending_data: null,
          accepted_data: null,
          confirmed_data: null,
          processing_data: null,
          handover_data: null,
          picked_up_data: null,
          delivered_data: null,
          canceled_data: null,
          refund_requested_data: null,
          refunded_data: null,
        } as any
      };
      const response = { data: mockResponse.data };
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching customer order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer order',
        data: null as any,
      };
    }
  },
};


export const customerUpdateOrdersApi = {
  // Get customer orders with pagination and status filter
  updateCustomerOrders: async (
    update: string = "confirmed",
    order_id: number = 1,
  ): Promise<ApiResponse<CustomerOrderResponse>> => {
    try {
      const token = await getStoredToken();
      
      // Build query parameters
      const requestBody = JSON.stringify({
        update, order_id
      })
      console.log("Get Customer Orders Update Params: ", requestBody.toString());
      
      // MOCK DATA: Commented out API call
      // const response = await axios.post(
      //   `${API_BASE_URL}/customer/order/update`,
      //   {update, order_id},
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          orders: [],
          total_size: 0,
          limit: null as any,
          offset: null as any,
          message: 'Order updated successfully',
        }
      };
      const response = { data: mockResponse.data };
      console.log("Get Customer Orders Response (MOCK): ", response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer orders',
        data: null as any,
      };
    }
  },

  // Get customer order by ID
  getCustomerOrderById: async (
    orderId: number
  ): Promise<ApiResponse<CustomerOrderDetails>> => {
    try {
      const token = await getStoredToken();
      
      // MOCK DATA: Commented out API call
      // const response = await axios.get(
      //   `${API_BASE_URL}/customer/order/details/${orderId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );
      
      // MOCK DATA: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK DATA: Return mock response
      const mockResponse = {
        data: {
          order_id: orderId,
          user_id: 1,
          order_amount: 0,
          coupon_discount_amount: 0,
          discount_amount: 0,
          coupon_code: null,
          discount_type: null,
          payment_status: 'pending',
          order_status: 'pending',
          payment_method: 'cash',
          transaction_reference: null,
          delivery_address_id: null,
          delivery_charge: 0,
          order_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivery_address: null,
          customer: null,
          details: [],
          delivery_man: null,
          time_slot: null,
          extra_packaging_amount: 0,
          free_delivery_by: null,
          free_delivery_amount: 0,
          order_type: 'delivery',
          store: null,
          schedule_at: null,
          callback: null,
          otp: null,
          pending: null,
          accepted: null,
          confirmed: null,
          processing: null,
          handover: null,
          picked_up: null,
          delivered: null,
          canceled: null,
          refund_requested: null,
          refunded: null,
          delivery_address_data: null,
          delivery_man_data: null,
          time_slot_data: null,
          extra_packaging_amount_data: null,
          free_delivery_by_data: null,
          free_delivery_amount_data: null,
          order_type_data: null,
          store_data: null,
          schedule_at_data: null,
          callback_data: null,
          otp_data: null,
          pending_data: null,
          accepted_data: null,
          confirmed_data: null,
          processing_data: null,
          handover_data: null,
          picked_up_data: null,
          delivered_data: null,
          canceled_data: null,
          refund_requested_data: null,
          refunded_data: null,
        } as any
      };
      const response = { data: mockResponse.data };
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error fetching customer order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer order',
        data: null as any,
      };
    }
  },
};