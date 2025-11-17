# Glowmify API Documentation

## 📚 Overview

This document provides comprehensive API documentation for the Glowmify e-commerce mobile application. The API is designed to support all core e-commerce functionality including product management, user authentication, order processing, and social commerce features.

## 🔗 Base URL

```
Development: https://api-dev.glowmify.com/v1
Production: https://api.glowmify.com/v1
```

## 🔐 Authentication

### Authentication Methods

1. **JWT Token Authentication** (Primary)
2. **Social Authentication** (Google, Facebook, Apple)
3. **API Key Authentication** (For server-to-server)

### Getting Started

```typescript
// Include JWT token in Authorization header
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

## 📱 Mobile App Integration

### Current Implementation
The mobile app currently uses a local database system for development and testing. All API functions are implemented but use mock data stored locally.

### API Service Structure
```typescript
// Example API service usage
import { productsApi, usersApi, ordersApi } from '../services/api';

// Get products
const products = await productsApi.getProducts(1, 20);

// Get user profile
const user = await usersApi.getUserById('user-id');

// Create order
const order = await ordersApi.createOrder(orderData);
```

## 🛍️ Products API

### Get Products
```typescript
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category ID
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field (price, rating, popularity, newest)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```typescript
{
  success: true,
  data: Product[],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Get Product by ID
```typescript
GET /products/:id
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    description: string,
    price: number,
    originalPrice?: number,
    isOnSale: boolean,
    discount?: number,
    images: string[],
    category: string,
    brand: string,
    rating: number,
    reviewCount: number,
    inStock: boolean,
    stockCount: number,
    sizes: string[],
    colors: Color[],
    seller: Seller,
    tags: string[],
    features: string[],
    specifications: Record<string, string>
  }
}
```

### Search Products
```typescript
GET /products/search
```

**Query Parameters:**
- `q` (string): Search query
- `page` (number): Page number
- `limit` (number): Items per page
- `filters` (object): Advanced filters

**Response:**
```typescript
{
  success: true,
  data: Product[],
  pagination: PaginationInfo,
  searchMeta: {
    query: string,
    totalResults: number,
    searchTime: number
  }
}
```

### Get Featured Products
```typescript
GET /products/featured
```

**Query Parameters:**
- `limit` (number): Number of products (default: 10)

### Get New Products
```typescript
GET /products/new
```

### Get Sale Products
```typescript
GET /products/sale
```

## 👤 Users API

### User Registration
```typescript
POST /auth/register
```

**Request Body:**
```typescript
{
  name: string,
  email: string,
  password: string,
  phone?: string,
  dateOfBirth?: string,
  preferences?: {
    notifications: boolean,
    newsletter: boolean,
    location: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: User,
    token: string,
    refreshToken: string
  }
}
```

### User Login
```typescript
POST /auth/login
```

**Request Body:**
```typescript
{
  email: string,
  password: string
}
```

### Social Authentication
```typescript
POST /auth/social
```

**Request Body:**
```typescript
{
  provider: 'google' | 'facebook' | 'apple',
  token: string,
  userInfo: {
    id: string,
    email: string,
    name: string,
    avatar?: string
  }
}
```

### Get User Profile
```typescript
GET /users/:id
```

### Update User Profile
```typescript
PUT /users/:id
```

### Change Password
```typescript
POST /users/:id/change-password
```

**Request Body:**
```typescript
{
  currentPassword: string,
  newPassword: string
}
```

### Forgot Password
```typescript
POST /auth/forgot-password
```

### Reset Password
```typescript
POST /auth/reset-password
```

## 🛒 Cart API

### Get Cart
```typescript
GET /cart
```

**Response:**
```typescript
{
  success: true,
  data: {
    items: CartItem[],
    subtotal: number,
    shipping: number,
    discount: number,
    total: number
  }
}
```

### Add to Cart
```typescript
POST /cart/add
```

**Request Body:**
```typescript
{
  productId: string,
  quantity: number,
  selectedSize?: string,
  selectedColor?: {
    name: string,
    hex: string
  }
}
```

### Update Cart Item
```typescript
PUT /cart/:itemId
```

**Request Body:**
```typescript
{
  quantity: number
}
```

### Remove from Cart
```typescript
DELETE /cart/:itemId
```

### Clear Cart
```typescript
DELETE /cart
```

## ❤️ Wishlist API

### Get Wishlist
```typescript
GET /wishlist
```

### Add to Wishlist
```typescript
POST /wishlist/add
```

**Request Body:**
```typescript
{
  productId: string
}
```

### Remove from Wishlist
```typescript
DELETE /wishlist/:productId
```

## 📦 Orders API

### Create Order
```typescript
POST /orders
```

**Request Body:**
```typescript
{
  items: CartItem[],
  shippingAddress: Address,
  billingAddress?: Address,
  paymentMethod: PaymentMethod,
  promoCode?: string,
  notes?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    order: Order,
    paymentIntent?: PaymentIntent
  }
}
```

### Get User Orders
```typescript
GET /orders
```

**Query Parameters:**
- `status` (string): Filter by order status
- `page` (number): Page number
- `limit` (number): Items per page

### Get Order by ID
```typescript
GET /orders/:id
```

### Cancel Order
```typescript
PUT /orders/:id/cancel
```

### Get Order Tracking
```typescript
GET /orders/:id/tracking
```

## 📍 Addresses API

### Get User Addresses
```typescript
GET /addresses
```

### Add Address
```typescript
POST /addresses
```

**Request Body:**
```typescript
{
  name: string,
  phone: string,
  street: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  isDefault?: boolean
}
```

### Update Address
```typescript
PUT /addresses/:id
```

### Delete Address
```typescript
DELETE /addresses/:id
```

### Set Default Address
```typescript
PUT /addresses/:id/default
```

## ⭐ Reviews API

### Get Product Reviews
```typescript
GET /products/:productId/reviews
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `rating` (number): Filter by rating

### Create Review
```typescript
POST /products/:productId/reviews
```

**Request Body:**
```typescript
{
  rating: number,
  title: string,
  comment: string,
  images?: string[]
}
```

### Update Review
```typescript
PUT /reviews/:id
```

### Delete Review
```typescript
DELETE /reviews/:id
```

## 🔔 Notifications API

### Get User Notifications
```typescript
GET /notifications
```

**Query Parameters:**
- `type` (string): Filter by notification type
- `unread` (boolean): Filter unread notifications
- `page` (number): Page number
- `limit` (number): Items per page

### Mark Notification as Read
```typescript
PUT /notifications/:id/read
```

### Mark All Notifications as Read
```typescript
PUT /notifications/read-all
```

### Delete Notification
```typescript
DELETE /notifications/:id
```

## 🏪 Sellers API

### Get Sellers
```typescript
GET /sellers
```

### Get Seller by ID
```typescript
GET /sellers/:id
```

### Get Seller Products
```typescript
GET /sellers/:id/products
```

### Follow Seller
```typescript
POST /sellers/:id/follow
```

### Unfollow Seller
```typescript
DELETE /sellers/:id/follow
```

## 📱 Stories API

### Get Stories
```typescript
GET /stories
```

### Get Story by ID
```typescript
GET /stories/:id
```

### Create Story
```typescript
POST /stories
```

**Request Body:**
```typescript
{
  productId: string,
  image: string,
  title: string,
  description?: string
}
```

## 💬 Chat API

### Get Conversations
```typescript
GET /chat/conversations
```

### Get Messages
```typescript
GET /chat/conversations/:id/messages
```

### Send Message
```typescript
POST /chat/conversations/:id/messages
```

**Request Body:**
```typescript
{
  content: string,
  type: 'text' | 'image' | 'product',
  metadata?: any
}
```

### Create Conversation
```typescript
POST /chat/conversations
```

**Request Body:**
```typescript
{
  sellerId: string,
  productId?: string
}
```

## 🔍 Search API

### Global Search
```typescript
GET /search
```

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Search type (products, sellers, users)
- `page` (number): Page number
- `limit` (number): Items per page

### Search Suggestions
```typescript
GET /search/suggestions
```

**Query Parameters:**
- `q` (string): Partial search query
- `limit` (number): Number of suggestions

## 📊 Analytics API

### Track Event
```typescript
POST /analytics/events
```

**Request Body:**
```typescript
{
  event: string,
  properties: Record<string, any>,
  userId?: string,
  sessionId?: string
}
```

### Get User Analytics
```typescript
GET /analytics/user/:id
```

## 🛡️ Error Handling

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Validation Errors
```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: {
      field: string,
      message: string
    }[]
  }
}
```

## 📈 Rate Limiting

### Limits
- **General API**: 1000 requests per hour per user
- **Search API**: 100 requests per hour per user
- **Upload API**: 50 requests per hour per user

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔄 Webhooks

### Order Status Update
```typescript
POST /webhooks/order-status
```

**Payload:**
```typescript
{
  event: 'order.status.updated',
  data: {
    orderId: string,
    status: string,
    timestamp: string
  }
}
```

### Payment Status Update
```typescript
POST /webhooks/payment-status
```

## 📱 Mobile App Integration Examples

### React Native Implementation
```typescript
// API service wrapper
class ApiService {
  private baseURL = 'https://api.glowmify.com/v1';
  private token: string | null = null;

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Product methods
  async getProducts(page = 1, limit = 20) {
    return this.request(`/products?page=${page}&limit=${limit}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Cart methods
  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }
}
```

### Error Handling
```typescript
try {
  const products = await apiService.getProducts();
  setProducts(products.data);
} catch (error) {
  console.error('Failed to load products:', error);
  setError('Failed to load products. Please try again.');
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadProducts = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await productsApi.getProducts();
    setProducts(response.data);
  } catch (err) {
    setError('Failed to load products');
  } finally {
    setLoading(false);
  }
};
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API
```typescript
// Update API base URL in services/api.ts
const API_BASE_URL = 'https://api.glowmify.com/v1';
```

### 3. Set Authentication
```typescript
// Set JWT token after login
apiService.setToken(userToken);
```

### 4. Start Development
```bash
npm start
```

## 📞 Support

For API support and questions:
- Email: api-support@glowmify.com
- Documentation: [API Docs]
- Status Page: [API Status]

---

**Glowmify API** - Powering the future of mobile commerce! 🚀
