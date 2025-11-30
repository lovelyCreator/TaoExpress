import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User, AuthResponse, GuestResponse, LoginRequest, RegisterRequest, GustLoginRequest } from '../types';
import axios, { AxiosError } from 'axios';

// API base URL - using environment variable or fallback
// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://10.0.2.2:5000/api/v1';
const API_BASE_URL = 'http://221.138.36.200:5000/api/v1';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout:', error.config?.url);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🔌 Network Error - Cannot reach server:', error.config?.url);
      console.error('   Make sure backend is running and accessible from emulator');
    } else {
      console.error('❌ API Error:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);

// In-memory storage for frontend-only mode with pre-configured test users
let frontendUsers: { [key: string]: { password: string; user: Partial<User> } } = {
  'test@example.com': {
    password: 'password123',
    user: {
      id: 'user_test_1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567890',
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      followersCount: 150,
      followingsCount: 89,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        currency: 'USD',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
  },
  'demo@example.com': {
    password: 'Demo123!',
    user: {
      id: 'user_demo_1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567891',
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      followersCount: 250,
      followingsCount: 120,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        currency: 'USD',
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
  },
};

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
    const requestBody = {
      email: email,
      password: password,
    };
    console.log("Login Request Body", requestBody);
    
    // Use fetch instead of axios
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Login Response Status:", response.status);
    
    // Get response text first to check if it's JSON
    const responseText = await response.text();
    console.log("Login Response Text:", responseText.substring(0, 200));
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Login Response", responseData);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      return {
        success: false,
        error: 'Invalid response from server. Please check your network connection.',
      };
    }

    // Check if request was successful
    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    // Validate response data
    if (!responseData || responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Invalid response from server',
      };
    }

    const { user, token, refreshToken } = responseData.data;
    
    // Create user object from response
    const userData: Partial<User> = {
      id: user.id,
      email: user.email,
      name: user.user_id || 'User',
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      followersCount: 0,
      followingsCount: 0,
      avatar: undefined,
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
    
    console.log("LOGIN USER TOKEN", token);
    
    // Store token and user data
    await storeAuthData(token, userData);
    
    // Store refresh token
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    return {
      success: true,
      data: {
        token,
        refreshToken,
        user: userData,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
    };
  }
};

// Register API (backend)
export const register = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  isBusiness: boolean = false
): Promise<{ success: boolean; data?: any; error?: string }> => {
  console.log("Registration attempt:", { email, name, phone, isBusiness });
  
  try {
    const requestBody = {
      email,
      password,
      user_id: name,
      phone,
      isBusiness,
    };
    console.log("Signup Request:", requestBody);

    // Use fetch instead of axios
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Signup Response Status:", response.status);
    console.log("Signup Response Headers:", response.headers);
    
    // Get response text first to check if it's JSON
    const responseText = await response.text();
    console.log("Signup Response Text:", responseText.substring(0, 200));
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Signup Response:", responseData);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      return {
        success: false,
        error: 'Invalid response from server. Please check your network connection.',
      };
    }
    
    // Check if request was successful
    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }
    
    // Validate response data
    if (!responseData || responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Invalid response from server',
      };
    }
    
    const { user, token, refreshToken } = responseData.data;
    
    // Create user object from response
    const userData: Partial<User> = {
      id: user.id,
      email: user.email,
      name: user.user_id,
      phone: user.phone,
      addresses: [],
      paymentMethods: [],
      wishlist: [],
      followersCount: 0,
      followingsCount: 0,
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

    // Store token and user data
    await storeAuthData(token, userData);
    
    // Store refresh token
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    return {
      success: true,
      data: {
        token,
        refreshToken,
        user: userData,
        message: responseData.message,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
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

// Social Login API (backend)
export const socialLogin = async (
  provider: string,
  accessToken: string,
  email: string,
  name: string,
  providerId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const guest_ids = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_ID);
    
    const requestBody = {
      provider, // 'google', 'facebook', 'apple', 'twitter', 'kakao'
      access_token: accessToken,
      email,
      name,
      provider_id: providerId,
      guest_id: guest_ids || '',
    };
    
    console.log('Social Login Request:', { provider, email, name });
    
    // MOCK DATA: Commented out API call
    // const response = await apiClient.post<AuthResponse>('/auth/social-login', requestBody);
    
    // MOCK DATA: Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // MOCK DATA: Return mock response
    const mockResponse = {
      data: {
        token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: providerId,
        email: email,
        first_name: name || email.split('@')[0] || 'User',
        follower_count: 0,
        following_count: 0,
        image: null,
      }
    };
    const response = { data: mockResponse.data };
    console.log('Social Login Response (MOCK):', response.data);

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
        let fixedJson: string = parsedData;
        if (fixedJson.trim().endsWith(',')) {
          fixedJson = fixedJson.trim().slice(0, -1);
        }
        if (!fixedJson.trim().endsWith('}')) {
          fixedJson = fixedJson.trim() + '}';
        }
        parsedData = JSON.parse(fixedJson);
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
    }

    // Create user object from response
    const userData: Partial<User> = {
      id: parsedData.user_id,
      email: parsedData.email,
      name: parsedData.first_name || 'User',
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
    console.error('Social login error:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (!axiosError.response) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }
      
      const errorData = axiosError.response.data as any;
      let parsedErrorData = errorData;
      
      if (typeof errorData === 'string') {
        try {
          let fixedJson: string = errorData;
          if (fixedJson.trim().endsWith(',')) {
            fixedJson = fixedJson.trim().slice(0, -1);
          }
          if (!fixedJson.trim().endsWith('}')) {
            fixedJson = fixedJson.trim() + '}';
          }
          parsedErrorData = JSON.parse(fixedJson);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
      }
      
      return {
        success: false,
        error: parsedErrorData?.errors?.[0]?.message || parsedErrorData?.message || 'Social login failed',
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
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

// Verify Email API
export const verifyEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email, code }),
    });

    console.log('Verify Email Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Verify Email Response Text:', responseText.substring(0, 200));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Verify Email Response:', responseData);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    if (responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Email verification failed',
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('Verify Email Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// Resend Verification Code API
export const resendVerificationCode = async (
  email: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email }),
    });

    console.log('Resend Code Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Resend Code Response Text:', responseText.substring(0, 200));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Resend Code Response:', responseData);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    if (responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Failed to resend code',
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('Resend Code Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// Forgot Password API
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email }),
    });

    console.log('Forgot Password Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Forgot Password Response Text:', responseText.substring(0, 200));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Forgot Password Response:', responseData);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    if (responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Failed to send reset link',
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// Reset Password API
export const resetPassword = async (
  email: string,
  code: string,
  password: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email, code, password }),
    });

    console.log('Reset Password Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('Reset Password Response Text:', responseText.substring(0, 200));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Reset Password Response:', responseData);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `Request failed with status ${response.status}`,
      };
    }

    if (responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Failed to reset password',
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('Reset Password Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};
