import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User, AuthResponse, GuestResponse, LoginRequest, RegisterRequest, GustLoginRequest } from '../types';
import axios, { AxiosError } from 'axios';

// API base URL - using the provided local endpoint
const API_BASE_URL = 'https://semistiff-vance-doctorly.ngrok-free.dev/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory storage for frontend-only mode
let frontendUsers: { [key: string]: { password: string; user: Partial<User> } } = {};

// Helper function to store user data and token
const storeAuthData = async (token: string, userData: Partial<User>) => {
  try {
    // console.log('Storing token:', token ? 'Token provided' : 'No token provided');
    // console.log('Storing user data:', userData);
    
    // Store the token
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    
    // Store user data
    const userString = JSON.stringify(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userString);
    // console.log("Store Datas Success!");
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

const storeGuestData = async (guest_id: number) => {
  try {
    // Store the token
    await AsyncStorage.setItem(STORAGE_KEYS.GUEST_ID, String(guest_id));
    
    // Store user data
    // const userString = JSON.stringify(userData);
    // await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userString);
    // console.log("Store Datas Success!");
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

// Helper function to clear auth data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Frontend-only login function
export const loginFrontendOnly = async (email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check if user exists
    if (!frontendUsers[email]) {
      return {
        success: false,
        error: 'User not found. Please register first.',
      };
    }

    // Check password
    if (frontendUsers[email].password !== password) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // Generate a mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user data
    const userData = frontendUsers[email].user;

    // Store token and user data
    await storeAuthData(token, userData);

    return {
      success: true,
      data: {
        token,
        user: userData,
      },
    };
  } catch (error) {
    console.error('Frontend-only login error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Frontend-only register function
export const registerFrontendOnly = async (
  email: string,
  password: string,
  name: string,
  gender: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check if user already exists
    if (frontendUsers[email]) {
      return {
        success: false,
        error: 'Email already registered.',
      };
    }

    // Create user object
    const userData: Partial<User> = {
      id: `user_${Date.now()}`,
      email,
      name,
    };

    // Store user in memory
    frontendUsers[email] = {
      password,
      user: userData,
    };

    // Generate a mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store token and user data
    await storeAuthData(token, userData);

    return {
      success: true,
      data: {
        token,
        user: userData,
      },
    };
  } catch (error) {
    console.error('Frontend-only registration error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Login API (backend)
export const login = async (email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const guest_ids = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_ID);
    // console.log("Guest Id", guest_ids);
    const requestBody: LoginRequest = {
      email_or_phone: email,
      password: password,
      login_type: 'manual',
      field_type: 'email',
      guest_id: guest_ids || '', // Using the provided guest_id
      
    };
    // console.log("Login Request Body", requestBody);
    
    // MOCK DATA: Commented out API call
    // const response = await apiClient.post<AuthResponse>('/auth/login', requestBody);
    // console.log("Login Response", response.data);
    
    // MOCK DATA: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // MOCK DATA: Return mock response
    const mockResponse = {
      data: {
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: '1',
        email: email,
        first_name: email.split('@')[0] || 'User',
        follower_count: 0,
        following_count: 0,
        image: null,
      }
    };
    const response = { data: mockResponse.data };
    console.log("Login Response (MOCK)", response.data);

    // Validate response data
    if (!response.data) {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    let parsedData = response.data;
    if (typeof parsedData === 'string') {
      try {
        // Try to fix malformed JSON by adding closing brace if missing
        let fixedJson: string = parsedData;
        if (fixedJson.trim().endsWith(',')) {
          fixedJson = fixedJson.trim().slice(0, -1);
        }
        if (!fixedJson.trim().endsWith('}')) {
          fixedJson = fixedJson.trim() + '}';
        }
        parsedData = JSON.parse(fixedJson);
      } catch (parseError) {
        // If parsing fails, use the original string
        console.error('Error parsing error response:', parseError);
      }
    }
    // Create user object from response
    const userData: Partial<User> = {
      id: parsedData.user_id, // Use email as ID for now, or extract from token if possible
      email: parsedData.email,
      name: parsedData.first_name || 'User', // Use email prefix as name
      // Add default values for other required fields
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      followersCount: parsedData.follower_count || 0,
      followingsCount: parsedData.following_count || 0,
      avatar: (parsedData as any).image || null,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        currency: 'USD',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log("LOGIN USER TOKEN", parsedData.token);
    // Store token and user data
    await storeAuthData(parsedData.token, userData);

    return {
      success: true,
      data: {
        token: parsedData.token,
        user: userData,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle network errors
      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      
      // Handle response errors
      const errorData = axiosError.response.data as any;
      
      // Try to parse error data if it's a string
      let parsedErrorData = errorData;
      if (typeof errorData === 'string') {
        try {
          // Try to fix malformed JSON by adding closing brace if missing
          let fixedJson: string = errorData;
          if (fixedJson.trim().endsWith(',')) {
            fixedJson = fixedJson.trim().slice(0, -1);
          }
          if (!fixedJson.trim().endsWith('}')) {
            fixedJson = fixedJson.trim() + '}';
          }
          parsedErrorData = JSON.parse(fixedJson);
        } catch (parseError) {
          // If parsing fails, use the original string
          console.error('Error parsing error response:', parseError);
        }
      }
      
      return {
        success: false,
        error: parsedErrorData?.errors?.[0]?.message || parsedErrorData?.message || 'Login failed',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Register API (backend)
export const register = async (
  email: string,
  password: string,
  name: string,
  gender: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const requestBody: RegisterRequest = {
      email,
      password,
      name,
      gender,
    };
    // console.log("Signup Request:" + requestBody.email + requestBody.password + requestBody.name + requestBody.gender);

    // MOCK DATA: Commented out API call
    // const response = await apiClient.post<AuthResponse>('/auth/sign-up', requestBody);
    
    // MOCK DATA: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // MOCK DATA: Return mock response
    const mockResponse = {
      data: {
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
      }
    };
    const response = { data: mockResponse.data };

    // console.log("Signup Response:" + response.data);
    
    // Validate response data
    if (!response.data) {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }
    
    // Create user object from response
    const userData: Partial<User> = {
      id: email, // Use email as ID for now
      email: response.data.email,
      name: name,
    };

    // Store token and user data
    await storeAuthData(response.data.token, userData);

    return {
      success: true,
      data: {
        token: response.data.token,
        user: userData,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle network errors
      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      
      // Handle response errors
      const errorData = axiosError.response.data as any;
      
      // Try to parse error data if it's a string
      let parsedErrorData = errorData;
      if (typeof errorData === 'string') {
        try {
          // Try to fix malformed JSON by adding closing brace if missing
          let fixedJson: string = errorData;
          if (fixedJson.trim().endsWith(',')) {
            fixedJson = fixedJson.trim().slice(0, -1);
          }
          if (!fixedJson.trim().endsWith('}')) {
            fixedJson = fixedJson.trim() + '}';
          }
          parsedErrorData = JSON.parse(fixedJson);
        } catch (parseError) {
          // If parsing fails, use the original string
          console.error('Error parsing error response:', parseError);
        }
      }
      
      // console.log("Signup Error: " + axiosError.response.status + "/" + errorData?.errors?.[0]?.message);
      return {
        success: false,
        error: parsedErrorData?.errors?.[0]?.message || parsedErrorData?.message || 'Registration failed',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Guest Login API (backend)
export const guestLogin = async (
  fcm_token: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const requestBody: GustLoginRequest = {
      fcm_token
    };

    // MOCK DATA: Commented out API call
    // const response = await apiClient.post<GuestResponse>('/auth/guest/request', requestBody);
    
    // MOCK DATA: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // MOCK DATA: Return mock response
    const mockResponse = {
      data: {
        guest_id: Math.floor(Math.random() * 10000),
      }
    };
    const response = { data: mockResponse.data };

    // Validate response data
    if (!response.data) {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    // Store guest ID
    await storeGuestData(response.data.guest_id);

    return {
      success: true,
      data: {
        guest_id: response.data.guest_id,
      },
    };
  } catch (error) {
    console.error('GuestLogin error:', error);
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle network errors
      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      
      // Handle response errors
      const errorData = axiosError.response.data as any;
      
      // Try to parse error data if it's a string
      let parsedErrorData = errorData;
      if (typeof errorData === 'string') {
        try {
          // Try to fix malformed JSON by adding closing brace if missing
          let fixedJson: string = errorData;
          if (fixedJson.trim().endsWith(',')) {
            fixedJson = fixedJson.trim().slice(0, -1);
          }
          if (!fixedJson.trim().endsWith('}')) {
            fixedJson = fixedJson.trim() + '}';
          }
          parsedErrorData = JSON.parse(fixedJson);
        } catch (parseError) {
          // If parsing fails, use the original string
          console.error('Error parsing error response:', parseError);
        }
      }
      
      // console.log("GuestLogin Error: " + errorData);
      return {
        success: false,
        error: parsedErrorData?.message || 'Guest Login failed',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// Get stored token
export const getStoredToken = async (): Promise<string | null> => {
  try {
    console.log('getStoredToken: Attempting to retrieve token');
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    console.log('getStoredToken: Retrieved token from storage:', token ? 'Token exists' : 'No token found');
    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

// Get stored user data
export const getStoredUserData = async (): Promise<User | null> => {
  try {
    const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting stored user data:', error);
    return null;
  }
};

// Change password API
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please log in again.',
      };
    }
    
    const requestBody = {
      // name: '', // This seems to be required by the API but can be empty
      // email: '', // This seems to be required by the API but can be empty
      password: newPassword,
      // current_password: currentPassword,
      button_type: 'change_password'
    };
    
    // MOCK DATA: Commented out API call
    // const response = await apiClient.post(
    //   '/customer/update-profile',
    //   requestBody,
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
        message: 'Password changed successfully',
      }
    };
    const response = { data: mockResponse.data };
    
    // Validate response data
    if (!response.data) {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Change password error:', error,);
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle network errors
      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      
      // Handle response errors
      const errorData = axiosError.response.data as any;
      
      // Try to parse error data if it's a string
      let parsedErrorData = errorData;
      if (typeof errorData === 'string') {
        try {
          // Try to fix malformed JSON by adding closing brace if missing
          let fixedJson: string = errorData;
          if (fixedJson.trim().endsWith(',')) {
            fixedJson = fixedJson.trim().slice(0, -1);
          }
          if (!fixedJson.trim().endsWith('}')) {
            fixedJson = fixedJson.trim() + '}';
          }
          parsedErrorData = JSON.parse(fixedJson);
        } catch (parseError) {
          // If parsing fails, use the original string
          console.error('Error parsing error response:', parseError);
        }
      }
      
      console.log("Change Password Error Confirm!", errorData);
      return {
        success: false,
        error: parsedErrorData?.message || parsedErrorData?.error || 'Failed to change password',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};
