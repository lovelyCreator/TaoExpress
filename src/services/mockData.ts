// Mock data for all API responses
// This file contains mock data that matches the API response structures

export const mockProducts = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    originalPrice: 249.99,
    discount: 50,
    discountPercentage: 20,
    images: ['https://via.placeholder.com/400'],
    category: { id: '1', name: 'Electronics', icon: '', image: '', subcategories: [] },
    subcategory: 'Audio',
    brand: 'TechBrand',
    seller: {
      id: '1',
      name: 'TechStore',
      avatar: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviewCount: 120,
      isVerified: true,
      followersCount: 5000,
      description: 'Premium tech products',
      location: 'New York, NY',
      joinedDate: new Date('2020-01-01'),
    },
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
    stockCount: 50,
    sizes: ['S', 'M', 'L'],
    tags: ['wireless', 'audio', 'premium'],
    isNew: true,
    isFeatured: true,
    isOnSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating_count: 120,
    avgRating: 4.5,
  },
];

export const mockCategories = [
  {
    id: '1',
    name: 'Electronics',
    icon: 'electronics',
    image: 'https://via.placeholder.com/200',
    description: 'Electronic devices and accessories',
    productCount: 150,
    subcategories: ['Phones', 'Laptops', 'Audio'],
  },
  {
    id: '2',
    name: 'Fashion',
    icon: 'fashion',
    image: 'https://via.placeholder.com/200',
    description: 'Clothing and accessories',
    productCount: 200,
    subcategories: ['Men', 'Women', 'Kids'],
  },
];

export const mockStores = [
  {
    id: '1',
    name: 'TechStore',
    logo_full_url: 'https://via.placeholder.com/100',
    avatar: { uri: 'https://via.placeholder.com/100' },
    description: 'Premium tech products',
    rating: 4.5,
    followersCount: 5000,
    isVerified: true,
    location: 'New York, NY',
  },
];

export const mockCartItems = [
  {
    id: '1',
    product: mockProducts[0],
    quantity: 2,
    price: 199.99,
  },
];

export const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'pending',
    items: mockCartItems,
    total: 399.98,
    subtotal: 399.98,
    tax: 32.00,
    shipping: 10.00,
    discount: 0,
    createdAt: new Date(),
  },
];

export const mockReviews = [
  {
    id: '1',
    userId: '1',
    productId: '1',
    userName: 'John Doe',
    rating: 5,
    title: 'Great product!',
    comment: 'Really happy with this purchase',
    isVerified: true,
    helpful: 10,
    createdAt: new Date(),
  },
];

export const mockAddresses = [
  {
    id: '1',
    type: 'home',
    name: 'John Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1234567890',
    isDefault: true,
  },
];

export const mockShippingServices = [
  {
    id: 1,
    store_id: 1,
    name: 'Standard Shipping',
    origin_zip: '10001',
    locations: [
      {
        id: 1,
        location: 'New York',
        one_item: 10.00,
        additional_item: 5.00,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockFollows = [
  {
    id: 1,
    store_id: 1,
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: mockStores[0],
  },
];

// Helper function to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

