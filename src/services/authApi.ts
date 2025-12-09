import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User, AuthResponse, GuestResponse, LoginRequest, RegisterRequest, GustLoginRequest } from '../types';
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
    ]);
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

    const { user, token, refreshToken, externalIds } = responseData.data;
    
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
    console.log("LOGIN EXTERNAL IDS", externalIds);
    
    // Store token and user data
    await storeAuthData(token, userData);
    
    // Store refresh token
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    
    // Store externalIds (wishlist IDs) to AsyncStorage
    if (externalIds && Array.isArray(externalIds)) {
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify(externalIds));
      console.log("Saved externalIds to AsyncStorage:", externalIds);
    } else {
      // If no externalIds, store empty array
      await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST_EXTERNAL_IDS, JSON.stringify([]));
    }

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
