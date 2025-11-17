import { Order, ApiResponse } from '../types';
import * as LocalDB from './localDatabase';

// Orders API
export const ordersApi = {
  // Create order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> => {
    try {
      const result = await LocalDB.createOrder(orderData);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create order',
        data: null as any,
      };
    }
  },

  // Get user orders
  getUserOrders: async (userId: string): Promise<ApiResponse<Order[]>> => {
    try {
      const result = await LocalDB.getUserOrders(userId);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get orders',
        data: null as any,
      };
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const orders = await LocalDB.getUserOrders('1'); // This is a mock implementation
      const order = orders.data.find(o => o.id === orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          data: null as any,
        };
      }
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get order',
        data: null as any,
      };
    }
  },
};