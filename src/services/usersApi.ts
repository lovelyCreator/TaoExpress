import { User, ApiResponse } from '../types';
import * as LocalDB from './localDatabase';

// Users API
export const usersApi = {
  // Get all users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const result = await LocalDB.getUsers();
    return {
      success: true,
      data: result.data,
    };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const result = await LocalDB.getUserById(id);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'User not found',
        data: null as any,
      };
    }
  },

  // Create user
  createUser: async (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    try {
      const result = await LocalDB.createUser(userData);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create user',
        data: null as any,
      };
    }
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const result = await LocalDB.updateUser(id, userData);
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user',
        data: null as any,
      };
    }
  },
};