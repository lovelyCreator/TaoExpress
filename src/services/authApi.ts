import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User, Address, AuthResponse, GuestResponse, LoginRequest, RegisterRequest, GustLoginRequest } from '../types';
import axios, { AxiosError } from 'axios';

// API base URL - using environment variable or fallback
// const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://10.0.2.2:5000/api/v1';
const API_BASE_URL = 'https://todaymall.co.kr/api/v1';

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

// Helper function to clear auth data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, // Clear wishlist external IDs on logout
    ]);
    console.log('Cleared auth data including wishlist external IDs');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Login API (backend)
export const login = async (email: string, password: string): Promise<{ success: boolean; data?: any; error?: string; errorCode?: string }> => {
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

    // Handle error responses (401, 422, etc.)
    if (!response.ok) {
      const errorCode = responseData?.errorCode;
      let errorMessage = responseData?.message || responseData?.error || `Request failed with status ${response.status}`;
      
      // Map errorCode to user-friendly messages
      switch (errorCode) {
        case 'EMAIL_NOT_VERIFIED':
          errorMessage = 'Please verify your email before logging in. Check your inbox for the verification link.';
          break;
        case 'INVALID_CREDENTIALS':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'VALIDATION_ERROR':
          // Try to parse validation errors
          try {
            // Check if message is already a string that looks like JSON
            let validationErrors;
            if (typeof responseData.message === 'string') {
              // Try to parse the string as JSON
              validationErrors = JSON.parse(responseData.message);
            } else {
              validationErrors = responseData.message;
            }
            
            // Handle array of validation errors
            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
              const firstError = validationErrors[0];
              
              // Extract the error message from the first error object
              if (typeof firstError === 'object') {
                const errorKey = Object.keys(firstError)[0];
                errorMessage = firstError[errorKey];
              } else if (typeof firstError === 'string') {
                errorMessage = firstError;
              }
            } else if (typeof validationErrors === 'string') {
              errorMessage = validationErrors;
            }
          } catch (e) {
            // If parsing fails, try to extract a clean message
            console.error('Failed to parse validation error:', e);
            
            // Check if the message contains common validation patterns
            const msg = responseData.message || '';
            if (msg.includes('email')) {
              errorMessage = 'Please enter a valid email address.';
            } else if (msg.includes('password')) {
              errorMessage = 'Please enter a valid password.';
            } else {
              errorMessage = 'Please check your input and try again.';
            }
          }
          break;
        default:
          errorMessage = responseData?.message || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
      };
    }

    // Validate response data
    if (!responseData || responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Invalid response from server',
        errorCode: responseData?.errorCode,
      };
    }

    // Extract data from new response structure
    const { user, token, refreshToken, cartCount } = responseData.data || {};
    
    // Check if externalIds is provided directly (backward compatibility)
    // Otherwise extract from user.wishlist (new structure)
    let externalIds: string[] = [];
    if (responseData.data?.externalIds && Array.isArray(responseData.data.externalIds)) {
      // Use externalIds if provided directly (backward compatibility)
      externalIds = responseData.data.externalIds.map((id: any) => id?.toString() || '').filter(Boolean);
    } else if (user?.wishlist && Array.isArray(user.wishlist)) {
      // Extract externalIds from wishlist items (new structure)
      externalIds = user.wishlist.map((item: any) => {
        const externalId = item.externalId?.toString() || '';
        return externalId;
      }).filter(Boolean);
    }
    
    if (!user || !token) {
      return {
        success: false,
        error: 'Invalid response data from server',
      };
    }
    
    // Map addresses from new structure
    const mappedAddresses = (user.addresses || []).map((addr: any) => ({
      id: addr._id || addr.id || '',
      type: (addr.customerClearanceType === 'business' ? 'work' : 'home') as 'home' | 'work' | 'other',
      name: addr.recipient || '',
      street: addr.detailedAddress || '',
      city: addr.mainAddress || '', // Use mainAddress if available
      state: '', // Not provided in new structure
      zipCode: addr.zipCode || '',
      country: '', // Not provided in new structure
      phone: addr.contact || '',
      isDefault: addr.defaultAddress || false,
      // Store additional fields as part of the address object (will be preserved in JSON)
      personalCustomsCode: addr.personalCustomsCode || '',
      note: addr.note || '',
      customerClearanceType: addr.customerClearanceType || 'individual',
    } as Address & { personalCustomsCode?: string; note?: string; customerClearanceType?: string }));
    
    // Map wishlist - extract externalIds from wishlist items for userData
    const wishlistExternalIds = externalIds;
    
    // Create user object from response
    const userData: Partial<User> = {
      id: user._id || user.user_id || user.id || '',
      email: user.email || '',
      name: user.user_id || user.email?.split('@')[0] || 'User',
      phone: user.phone || '',
      birthday: user.birthday || undefined,
      addresses: mappedAddresses,
      paymentMethods: [], // Not provided in response
      wishlist: wishlistExternalIds, // Store externalIds as wishlist array
      followersCount: 0, // Not provided in response
      followingsCount: 0, // Not provided in response
      avatar: undefined, // Not provided in response
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        language: 'en',
        currency: 'USD',
      },
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    };
    
    console.log("LOGIN USER TOKEN", token);
    console.log("LOGIN EXTERNAL IDS", externalIds);
    console.log("LOGIN CART COUNT", cartCount);
    console.log("LOGIN USER DATA", userData);
    
    // Store token and user data
    await storeAuthData(token, userData);
    
    // Store refresh token
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    // Store externalIds (wishlist IDs) to AsyncStorage
    if (externalIds && Array.isArray(externalIds)) {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify(externalIds));
      console.log("Saved externalIds to AsyncStorage:", externalIds);
    } else {
      // If no externalIds, store empty array
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify([]));
    }
    
    // Store cartCount if provided
    if (cartCount !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.CART_COUNT, JSON.stringify(cartCount));
      console.log("Saved cartCount to AsyncStorage:", cartCount);
    }

    return {
      success: true,
      data: {
        token,
        refreshToken,
        user: userData,
        cartCount,
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
  isBusiness: boolean = false,
  referralCode?: string
): Promise<{ success: boolean; data?: any; error?: string; errorCode?: string }> => {
  console.log("Registration attempt:", { email, name, phone, isBusiness, referralCode });
  
  try {
    const requestBody: any = {
      email,
      password,
      user_id: name,
      phone,
      isBusiness,
    };
    
    // Add referral code if provided
    if (referralCode && referralCode.trim() !== '') {
      requestBody.referralCode = referralCode.trim();
    }
    
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
      // Handle error by errorCode
      const errorCode = responseData?.errorCode;
      let errorMessage = responseData?.message || responseData?.error || `Request failed with status ${response.status}`;
      
      // Map errorCode to user-friendly messages
      switch (errorCode) {
        case 'EMAIL_ALREADY_REGISTERED':
          errorMessage = 'This email is already registered. Please login instead.';
          break;
        case 'INVALID_REFERRAL_CODE':
          errorMessage = 'Invalid referral code. Please check and try again.';
          break;
        case 'VALIDATION_ERROR':
          // Try to parse validation errors
          try {
            // Check if message is already a string that looks like JSON
            let validationErrors;
            if (typeof responseData.message === 'string') {
              // Try to parse the string as JSON
              validationErrors = JSON.parse(responseData.message);
            } else {
              validationErrors = responseData.message;
            }
            
            // Handle array of validation errors
            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
              const firstError = validationErrors[0];
              
              // Extract the error message from the first error object
              if (typeof firstError === 'object') {
                const errorKey = Object.keys(firstError)[0];
                errorMessage = firstError[errorKey];
              } else if (typeof firstError === 'string') {
                errorMessage = firstError;
              }
            } else if (typeof validationErrors === 'string') {
              errorMessage = validationErrors;
            }
          } catch (e) {
            // If parsing fails, try to extract a clean message
            console.error('Failed to parse validation error:', e);
            
            // Check if the message contains common validation patterns
            const msg = responseData.message || '';
            if (msg.includes('email')) {
              errorMessage = 'Please enter a valid email address.';
            } else if (msg.includes('password')) {
              errorMessage = 'Password does not meet requirements.';
            } else if (msg.includes('name')) {
              errorMessage = 'Please enter a valid name.';
            } else {
              errorMessage = 'Please check your input and try again.';
            }
          }
          break;
        default:
          // Use the message from the API
          errorMessage = responseData?.message || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode, // Include errorCode for programmatic handling
      };
    }
    
    // Validate response data
    if (!responseData || responseData.status !== 'success') {
      // This handles cases where response.ok is true but status is not 'success'
      const errorCode = responseData?.errorCode;
      return {
        success: false,
        error: responseData?.message || 'Invalid response from server',
        errorCode: errorCode,
      };
    }
    
    // Check if response has data (with user and token) or just a message
    if (responseData.data && responseData.data.user && responseData.data.token) {
      // Full registration response with user data and token
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
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      return {
        success: true,
        data: {
          token,
          refreshToken,
          user: userData,
          message: responseData.message,
        },
      };
    } else {
      // Registration successful but requires email verification
      // No user data or token yet - user needs to verify email first
      return {
        success: true,
        data: {
          email: email, // Pass the email for verification screen
          message: responseData.message,
          requiresVerification: true,
        },
      };
    }
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

// Get profile API
export interface GetProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      _id: string;
      email: string;
      user_id: string;
      phone?: string;
      isBusiness?: boolean;
      isEmailVerified?: boolean;
      authProvider?: string;
      wishlist?: string[];
      points?: number;
      addresses?: any[];
      createdAt?: string;
      updatedAt?: string;
      referralCode?: string;
      lastLogin?: string;
      birthday?: string;
      gender?: string;
      mainAddress?: string;
      pictureUrl?: string;
      [key: string]: any;
    };
  };
  error?: string;
}

export const getProfile = async (): Promise<GetProfileResponse> => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please log in again.',
      };
    }
    
    const url = `${API_BASE_URL}/users/profile`;
    console.log('Sending get profile request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    console.log('Get profile response status:', response.status);
    
    const responseText = await response.text();
    console.log('Get profile response text:', responseText.substring(0, 500));
    
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
        error: responseData?.message || 'Failed to get profile',
      };
    }
    
    return {
      success: true,
      message: responseData.message || 'Profile retrieved successfully',
      data: responseData.data,
    };
  } catch (error: any) {
    console.error('Get profile error:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
};

// Update profile API
export interface UpdateProfileRequest {
  user_id?: string;
  phone?: string;
  isBusiness?: boolean;
  gender?: string;
  birthday?: string;
  picture?: string; // File URI for the picture
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      _id: string;
      email: string;
      user_id: string;
      phone?: string;
      isBusiness?: boolean;
      gender?: string;
      birthday?: string;
      pictureUrl?: string;
      wishlist?: string[];
      addresses?: any[];
      [key: string]: any;
    };
  };
  error?: string;
}

export const updateProfile = async (
  request: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please log in again.',
      };
    }
    
    const url = `${API_BASE_URL}/users/profile`;
    console.log('Sending update profile request to:', url);
    
    // Create FormData
    const formData = new FormData();
    
    // Add text fields if provided
    if (request.user_id) {
      formData.append('user_id', request.user_id);
    }
    if (request.phone) {
      formData.append('phone', request.phone);
    }
    if (request.gender) {
      formData.append('gender', request.gender);
    }
    if (request.birthday) {
      formData.append('birthday', request.birthday);
    }
    if (request.isBusiness !== undefined) {
      // FormData in React Native accepts boolean, but we'll convert to string for consistency
      formData.append('isBusiness', String(request.isBusiness));
    }
    
    // Add picture file if provided
    if (request.picture) {
      // In React Native, we need to create a file object from the URI
      const fileUri = request.picture;
      const filename = fileUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // React Native FormData format for file upload
      formData.append('picture', {
        uri: fileUri,
        name: filename,
        type: type,
      } as any);
    }
    
    console.log('Update profile request fields:', {
      user_id: request.user_id,
      phone: request.phone,
      gender: request.gender,
      birthday: request.birthday,
      isBusiness: request.isBusiness,
      hasPicture: !!request.picture,
    });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        // Don't set Content-Type - browser/React Native will set it automatically with boundary
      },
      body: formData,
    });
    
    console.log('Update profile response status:', response.status);
    
    const responseText = await response.text();
    console.log('Update profile response text:', responseText.substring(0, 500));
    
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
        error: responseData?.message || 'Profile update failed',
      };
    }
    
    return {
      success: true,
      message: responseData.message || 'Profile updated successfully',
      data: responseData.data,
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
};

// Change password API
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  try {
    const token = await getStoredToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please log in again.',
      };
    }
    
    const requestBody: ChangePasswordRequest = {
      currentPassword,
      newPassword,
    };
    
    const url = `${API_BASE_URL}/users/change-password`;
    console.log('Sending change password request to:', url);
    console.log('Change password request body:', JSON.stringify({ currentPassword: '***', newPassword: '***' }, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Change password response status:', response.status);
    
    const responseText = await response.text();
    console.log('Change password response text:', responseText.substring(0, 500));
    
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
        error: responseData?.message || 'Password change failed',
      };
    }
    
    return {
      success: true,
      message: responseData.message || 'Password changed successfully',
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
};

// Verify Email API
export const verifyEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; data?: any; error?: string; errorCode?: string }> => {
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

    // Handle error responses (400, 404, 422)
    if (!response.ok) {
      const errorCode = responseData?.errorCode;
      let errorMessage = responseData?.message || responseData?.error || `Request failed with status ${response.status}`;
      
      // Map errorCode to user-friendly messages
      switch (errorCode) {
        case 'INVALID_VERIFICATION_CODE':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'USER_NOT_FOUND':
          errorMessage = 'User not found. Please register again.';
          break;
        case 'VERIFICATION_CODE_EXPIRED':
          errorMessage = 'Verification code has expired. Please request a new code.';
          break;
        case 'VALIDATION_ERROR':
          errorMessage = 'Invalid verification code format.';
          break;
        default:
          errorMessage = responseData?.message || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
      };
    }

    // Check if response status is success
    if (responseData.status !== 'success') {
      return {
        success: false,
        error: responseData?.message || 'Email verification failed',
        errorCode: responseData?.errorCode,
      };
    }

    // Success case (200) - Extract user data and token
    if (responseData.data && responseData.data.user && responseData.data.token) {
      const { user, token, refreshToken } = responseData.data;
      
      // Create user object from response
      const userData: Partial<User> = {
        id: user.id,
        email: user.email,
        name: user.user_id || user.name || 'User',
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
      
      // Store refresh token if provided
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      return {
        success: true,
        data: {
          token,
          refreshToken,
          user: userData,
          message: responseData.message,
        },
      };
    }

    // Fallback if data structure is unexpected
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error('Verify Email Error:', error);
    
    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
    
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
