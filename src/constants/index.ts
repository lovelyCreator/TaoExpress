import { transform } from 'lodash';
import { Dimensions } from 'react-native';

// Screen Dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Colors - 2025 Korean E-commerce Aesthetic
export const COLORS = {
  // Primary Colors - Soft pastels (Korean favorite)
  primary: '#B8A9FF', // Soft lavender
  primaryDark: '#9B7EDE',
  primaryLight: '#D4C9FF',
  transparent: '#11111101',
  
  // Secondary Colors - Muted coral pink
  secondary: '#FFB3BA', // Baby pink
  secondaryDark: '#FF9AA1',
  secondaryLight: '#FFCCD1',
  // Brand Accent - Soft rose
  accentPink: '#FF6B9D',
  
  // Neutral Colors - Warm grays
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Status Colors - Softer tones
  success: '#4CAF50',
  warning: '#FFB74D',
  error: '#FF6B6B',
  info: '#64B5F6',
  
  // Background Colors - Subtle off-white
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  onboardingBackground: '#FAFAFA',
  
  // Text Colors - Softer blacks
  text: {
    primary: '#2C2C2C',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
    custom: '#424242'
  },
  
  // Border Colors - Subtle
  border: '#EEEEEE',
  borderLight: '#F5F5F5',
  borderDark: '#E0E0E0',
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
  
  // Gradient Colors - Soft and elegant
  gradients: {
    primary: ['#9B7EDE', '#C4B5F6'],
    secondary: ['#FF9B9B', '#FFBDBD'],
    accent: ['#FFB74D', '#FFD54F'],
    success: ['#81C784', '#A5D6A7'],
    sunset: ['#FF8A80', '#FFCCBC'],
    ocean: ['#81D4FA', '#B3E5FC'],
    forest: ['#A5D6A7', '#C8E6C9'],
    rose: ['#FF6B9D', '#FFB3D9'],
  },
};

// Typography
export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    smmd: 15,
    md: 16,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '2lgxl': 26,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  families: {
    regular: 'Satoshi',
    medium: 'Satoshi',
    bold: 'Satoshi',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  smmd: 14,
  md: 16,
  mdlg: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://192.168.5.54:8001/api/v1', // Default to HTTPS
  timeout: 10000,
  retryAttempts: 3,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  WISHLIST_DATA: 'wishlist_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME_PREFERENCE: 'theme_preference',
  GUEST_ID: 'guest_id',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Product Categories
export const CATEGORIES = [
  {
    id: 'fashion',
    name: 'Fashion',
    icon: 'shirt',
    subcategories: ['Women', 'Men', 'Kids', 'Accessories', 'Shoes'],
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: 'diamond',
    subcategories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'],
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: 'sparkles',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Tools'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'phone-portrait',
    subcategories: ['Phones', 'Laptops', 'Audio', 'Cameras', 'Gaming'],
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: 'home',
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Bath'],
  },
];

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

// Payment Method Icons
export const PAYMENT_METHOD_ICONS = {
  card: 'credit-card',
  paypal: 'paypal',
  apple_pay: 'apple',
  google_pay: 'google',
};

// Social Login Providers
export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'facebook',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  OFFER: 'offer',
  ACTIVITY: 'activity',
  PROMOTION: 'promotion',
};

// Story Duration
export const STORY_DURATION = 5000; // 5 seconds

// Cart Limits
export const CART_LIMITS = {
  MAX_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 10,
};

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 10,
};

// Image Configuration
export const IMAGE_CONFIG = {
  QUALITY: 0.8,
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  THUMBNAIL_SIZE: 150,
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  CART_EMPTY: 'Your cart is empty.',
  PRODUCT_OUT_OF_STOCK: 'This product is out of stock.',
  INVALID_PROMO_CODE: 'Invalid promo code.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  ORDER_NOT_FOUND: 'Order not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET: 'Password reset email sent.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ADDRESS_ADDED: 'Address added successfully.',
  ADDRESS_UPDATED: 'Address updated successfully.',
  ADDRESS_DELETED: 'Address deleted successfully.',
  PAYMENT_METHOD_ADDED: 'Payment method added successfully.',
  PAYMENT_METHOD_UPDATED: 'Payment method updated successfully.',
  PAYMENT_METHOD_DELETED: 'Payment method deleted successfully.',
  ITEM_ADDED_TO_CART: 'Item added to cart.',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart.',
  CART_UPDATED: 'Cart updated successfully.',
  ORDER_PLACED: 'Order placed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully.',
  WISHLIST_ADDED: 'Added to wishlist.',
  WISHLIST_REMOVED: 'Removed from wishlist.',
  NOTIFICATION_SETTINGS_UPDATED: 'Notification settings updated.',
};