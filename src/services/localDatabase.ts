import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Category, User, Order, Review, Story, Seller, Notification, CartItem } from '../types';

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USERS: 'users',
  CREDENTIALS: 'credentials',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  STORIES: 'stories',
  SELLERS: 'sellers',
  NOTIFICATIONS: 'notifications',
  CART: 'cart',
  WISHLIST: 'wishlist',
  CURRENT_USER: 'current_user',
} as const;

// Helper functions for AsyncStorage
const storeData = async (key: string, data: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    // Don't throw error to prevent app crash
  }
};

const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

// Initialize local database with mock data
export const initializeLocalDatabase = async (): Promise<void> => {
  try {
    // Check if data already exists
    const existingProducts = await getData<Product[]>(STORAGE_KEYS.PRODUCTS);
    if (existingProducts && existingProducts.length > 0) {
      console.log('Local database already initialized');
      return; // Data already exists
    }

    console.log('Initializing local database with empty data...');

    // Store all data with individual error handling
    try {
      await storeData(STORAGE_KEYS.PRODUCTS, []);
      console.log('Empty products stored');
    } catch (error) {
      console.error('Error storing products:', error);
    }

    try {
      await storeData(STORAGE_KEYS.CATEGORIES, []);
      console.log('Empty categories stored');
    } catch (error) {
      console.error('Error storing categories:', error);
    }

    try {
      await storeData(STORAGE_KEYS.USERS, []);
      console.log('Empty users stored');
    } catch (error) {
      console.error('Error storing users:', error);
    }

    try {
      await storeData(STORAGE_KEYS.SELLERS, []);
      console.log('Empty sellers stored');
    } catch (error) {
      console.error('Error storing sellers:', error);
    }

    try {
      await storeData(STORAGE_KEYS.STORIES, []);
      console.log('Empty stories stored');
    } catch (error) {
      console.error('Error storing stories:', error);
    }

    try {
      await storeData(STORAGE_KEYS.REVIEWS, []);
      console.log('Empty reviews stored');
    } catch (error) {
      console.error('Error storing reviews:', error);
    }

    try {
      await storeData(STORAGE_KEYS.ORDERS, []);
      console.log('Empty orders stored');
    } catch (error) {
      console.error('Error storing orders:', error);
    }

    try {
      await storeData(STORAGE_KEYS.NOTIFICATIONS, []);
      console.log('Empty notifications stored');
    } catch (error) {
      console.error('Error storing notifications:', error);
    }

    try {
      await storeData(STORAGE_KEYS.CART, []);
      await storeData(STORAGE_KEYS.WISHLIST, []);
      console.log('Empty collections initialized');
    } catch (error) {
      console.error('Error initializing empty collections:', error);
    }

    console.log('Local database initialized successfully with empty data');
  } catch (error) {
    console.error('Error initializing local database:', error);
    // Don't throw the error to prevent app crash
    // The app can still function with empty data
  }
};

// Products
export const getProducts = async (page: number = 1, limit: number = 20, filters?: any): Promise<{ data: Product[]; pagination: any }> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  
  let filteredProducts = [...products];
  
  // Apply filters
  if (filters) {
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category.id === filters.category);
    }
    if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(p => filters.categories.includes(p.category.name));
    }
    if (filters.sellerId) {
      filteredProducts = filteredProducts.filter(p => p.seller.id === filters.sellerId);
    }
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.minRating);
    }
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(p => p.inStock);
    }
    if (filters.onSale) {
      filteredProducts = filteredProducts.filter(p => p.isOnSale);
    }
    if (filters.brand) {
      filteredProducts = filteredProducts.filter(p => p.brand === filters.brand);
    }
    if (filters.brands && Array.isArray(filters.brands) && filters.brands.length > 0) {
      filteredProducts = filteredProducts.filter(p => filters.brands.includes(p.brand));
    }
    if (filters.size) {
      filteredProducts = filteredProducts.filter(p => (p.sizes || []).includes(filters.size));
    }
    if (filters.sizes && Array.isArray(filters.sizes) && filters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(p => {
        const available = p.sizes || [];
        return filters.sizes.some((s: string) => available.includes(s));
      });
    }
  }
  
  // Sorting
  if (filters && filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
        filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }
  }
  
  // Pagination
  const total = filteredProducts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return {
    data: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: endIndex < total,
      hasPrevPage: startIndex > 0,
    }
  };
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  return products.find(p => p.id === id) || null;
};

// Get "You May Like" products based on a product
export const getYouMayLikeProducts = async (productId: string, limit: number = 8): Promise<Product[]> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  const currentProduct = products.find(p => p.id === productId);
  
  if (!currentProduct) {
    // If no current product, return random products
    return products.slice(0, Math.min(limit, products.length));
  }
  
  // Filter products based on similar criteria:
  // 1. Same category (highest priority)
  // 2. Same brand
  // 3. Similar price range (+/- 30%)
  // 4. Same seller
  // 5. Random if not enough matches
  
  let similarProducts: Product[] = [];
  
  // Priority 1: Same category
  const sameCategoryProducts = products.filter(p => 
    p.id !== productId && 
    p.category.id === currentProduct.category.id
  );
  similarProducts = [...similarProducts, ...sameCategoryProducts];
  
  // Priority 2: Same brand
  const sameBrandProducts = products.filter(p => 
    p.id !== productId && 
    p.brand === currentProduct.brand &&
    !similarProducts.some(sp => sp.id === p.id)
  );
  similarProducts = [...similarProducts, ...sameBrandProducts];
  
  // Priority 3: Similar price range (+/- 30%)
  const priceRangeMin = currentProduct.price * 0.7;
  const priceRangeMax = currentProduct.price * 1.3;
  const similarPriceProducts = products.filter(p => 
    p.id !== productId && 
    p.price >= priceRangeMin && 
    p.price <= priceRangeMax &&
    !similarProducts.some(sp => sp.id === p.id)
  );
  similarProducts = [...similarProducts, ...similarPriceProducts];
  
  // Priority 4: Same seller
  const sameSellerProducts = products.filter(p => 
    p.id !== productId && 
    p.seller.id === currentProduct.seller.id &&
    !similarProducts.some(sp => sp.id === p.id)
  );
  similarProducts = [...similarProducts, ...sameSellerProducts];
  
  // If we still don't have enough products, add some random ones
  if (similarProducts.length < limit) {
    const remainingNeeded = limit - similarProducts.length;
    const randomProducts = products.filter(p => 
      p.id !== productId && 
      !similarProducts.some(sp => sp.id === p.id)
    ).slice(0, remainingNeeded);
    similarProducts = [...similarProducts, ...randomProducts];
  }
  
  // Return up to the limit
  return similarProducts.slice(0, limit);
};

export const getLatestProductsByCategory = async (
  categoryId: number,
  offset: number = 1,
  limit: number = 13,
  type: string = 'all',
  filter: string = '[]',
  ratingCount: string = '',
  minPrice: number = 0.0,
  maxPrice: number = 999999.0,
  search: string = '',
  sellerId?: string
): Promise<{ data: Product[] }> => {
  let products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  
  // Filter by sellerId if provided
  if (sellerId) {
    products = products.filter(p => p.seller.id === sellerId);
  }
  
  // Parse filters if provided
  let parsedFilters: any[] = [];
  if (filter && filter !== '[]') {
    try {
      parsedFilters = JSON.parse(filter);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  
  // Filter products based on criteria
  let filteredProducts = [...products];
  
  // Apply category filter - this is the key fix for the issue
  if (categoryId !== undefined && categoryId !== null) {
    filteredProducts = filteredProducts.filter(p => 
      Number(p.category.id) === categoryId
    );
  }
  
  // Apply search filter
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply price filters
  filteredProducts = filteredProducts.filter(p => 
    p.price >= minPrice && p.price <= maxPrice
  );
  
  // Apply rating filter from parsed filters
  for (const filterObj of parsedFilters) {
    if (filterObj.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filterObj.minRating);
    }
  }
  
  // Sort by creation date descending (latest first)
  filteredProducts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Apply pagination
  const startIndex = (offset - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return { data: paginatedProducts };
};

export const getMostReviewedProducts = async (
  categoryIds: number[],
  offset: number = 1,
  limit: number = 25,
  type: string = 'all',
  filter: string = '[]',
  ratingCount: string = '',
  minPrice: number = 0.0,
  maxPrice: number = 9999999999.0,
  search: string = '',
  sellerId?: string
): Promise<{ data: Product[] }> => {
  let products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  
  // Filter by sellerId if provided
  if (sellerId) {
    products = products.filter(p => p.seller.id === sellerId);
  }
  
  // Parse filters if provided
  let parsedFilters: any[] = [];
  if (filter && filter !== '[]') {
    try {
      parsedFilters = JSON.parse(filter);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  
  // Filter products based on criteria
  let filteredProducts = [...products];
  
  // Apply category filter - this is the key fix for the issue
  if (categoryIds && categoryIds.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      categoryIds.includes(Number(p.category.id))
    );
  }
  
  // Apply search filter
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply price filters
  filteredProducts = filteredProducts.filter(p => 
    p.price >= minPrice && p.price <= maxPrice
  );
  
  // Apply rating filter from parsed filters
  for (const filterObj of parsedFilters) {
    if (filterObj.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filterObj.minRating);
    }
    // Apply category filter from parsed filters if not already applied
    if (filterObj.categories && Array.isArray(filterObj.categories) && filterObj.categories.length > 0) {
      // Only apply if we haven't already filtered by categoryIds
      if (!categoryIds || categoryIds.length === 0) {
        filteredProducts = filteredProducts.filter(p => 
          filterObj.categories.includes(Number(p.category.id))
        );
      }
    }
  }
  
  // Sort by review count descending (most reviewed)
  filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
  
  // Apply pagination
  const startIndex = (offset - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return { data: paginatedProducts };
};

export const getPopularProducts = async (
  categoryIds: number[],
  offset: number = 1,
  limit: number = 10,
  type: string = 'all',
  filter: string = '[]',
  ratingCount: string = '',
  minPrice: number = 0.0,
  maxPrice: number = 9999999999.0,
  search: string = '',
  sellerId?: string
): Promise<{ data: Product[] }> => {
  let products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  
  // Filter by sellerId if provided
  if (sellerId) {
    products = products.filter(p => p.seller.id === sellerId);
  }
  
  // Parse filters if provided
  let parsedFilters: any[] = [];
  let sortType: string | null = null;
  
  if (filter && filter !== '[]') {
    try {
      parsedFilters = JSON.parse(filter);
      // Check if filter contains sort type
      if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
        if (parsedFilters.includes('high')) {
          sortType = 'price_high';
        } else if (parsedFilters.includes('low')) {
          sortType = 'price_low';
        }
      }
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  
  // Check ratingCount parameter for review count sorting
  if (ratingCount === 'review_count') {
    sortType = 'review_count';
  }
  
  // Filter products based on criteria
  let filteredProducts = [...products];
  
  // Apply category filter - this is the key fix for the issue
  if (categoryIds && categoryIds.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      categoryIds.includes(Number(p.category.id))
    );
  }
  
  // Apply search filter
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply price filters
  filteredProducts = filteredProducts.filter(p => 
    p.price >= minPrice && p.price <= maxPrice
  );
  
  // Apply rating filter from parsed filters
  for (const filterObj of parsedFilters) {
    if (filterObj.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filterObj.minRating);
    }
    // Apply category filter from parsed filters if not already applied
    if (filterObj.categories && Array.isArray(filterObj.categories) && filterObj.categories.length > 0) {
      // Only apply if we haven't already filtered by categoryIds
      if (!categoryIds || categoryIds.length === 0) {
        filteredProducts = filteredProducts.filter(p => 
          filterObj.categories.includes(Number(p.category.id))
        );
      }
    }
  }
  
  // Sort based on sortType
  if (sortType === 'price_high') {
    // Sort by price descending (high to low)
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortType === 'price_low') {
    // Sort by price ascending (low to high)
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === 'review_count') {
    // Sort by review count descending
    filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    // Default sort by popularity (review count descending)
    filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
  }
  
  // Apply pagination
  const startIndex = (offset - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return { data: paginatedProducts };
};

export const getFeaturedProducts = async (limit: number = 10): Promise<{ data: Product[] }> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  const featured = products.filter(p => p.isFeatured).slice(0, limit);
  return { data: featured };
};

export const getNewProducts = async (limit: number = 10): Promise<{ data: Product[] }> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  const newProducts = products.filter(p => p.isNew).slice(0, limit);
  return { data: newProducts };
};

export const getSaleProducts = async (limit: number = 10): Promise<{ data: Product[] }> => {
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  const saleProducts = products.filter(p => p.isOnSale).slice(0, limit);
  return { data: saleProducts };
};

export const searchProducts = async (query: string, page: number = 1, limit: number = 20, filters?: any, sellerId?: string): Promise<{ data: Product[]; pagination: any }> => {
  let products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  
  // Filter by sellerId if provided
  if (sellerId) {
    products = products.filter(p => p.seller.id === sellerId);
  }
  
  let filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase())
  );
  
  // Apply additional filters
  if (filters) {
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category.id === filters.category);
    }
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.minRating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.minRating);
    }
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return {
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1,
    }
  };
};

// Categories
export const getCategories = async (): Promise<{ data: Category[] }> => {
  const categories = await getData<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
  return { data: categories };
};

export const getCategoryById = async (id: string): Promise<{ data: Category }> => {
  const categories = await getData<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
  const category = categories.find(c => c.id === id);
  if (!category) {
    throw new Error('Category not found');
  }
  return { data: category };
};

// Users
export const getUsers = async (): Promise<{ data: User[] }> => {
  const users = await getData<User[]>(STORAGE_KEYS.USERS) || [];
  return { data: users };
};

export const getUserById = async (id: string): Promise<{ data: User }> => {
  const users = await getData<User[]>(STORAGE_KEYS.USERS) || [];
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return { data: user };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getData<User[]>(STORAGE_KEYS.USERS) || [];
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};

type Credential = { email: string; password: string };

export const addCredentials = async (email: string, password: string): Promise<void> => {
  const creds = await getData<Credential[]>(STORAGE_KEYS.CREDENTIALS) || [];
  const idx = creds.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) {
    creds[idx].password = password;
  } else {
    creds.push({ email, password });
  }
  await storeData(STORAGE_KEYS.CREDENTIALS, creds);
};

export const validateCredentials = async (email: string, password: string): Promise<boolean> => {
  const creds = await getData<Credential[]>(STORAGE_KEYS.CREDENTIALS) || [];
  const entry = creds.find(c => c.email.toLowerCase() === email.toLowerCase());
  return !!entry && entry.password === password;
};

export const clearAllCredentials = async (): Promise<void> => {
  await storeData(STORAGE_KEYS.CREDENTIALS, []);
};

export const removeCredentials = async (email: string): Promise<void> => {
  const creds = await getData<Credential[]>(STORAGE_KEYS.CREDENTIALS) || [];
  const filteredCreds = creds.filter(c => c.email.toLowerCase() !== email.toLowerCase());
  await storeData(STORAGE_KEYS.CREDENTIALS, filteredCreds);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<{ data: User }> => {
  const users = await getData<User[]>(STORAGE_KEYS.USERS) || [];
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
  };
  users.push(newUser);
  await storeData(STORAGE_KEYS.USERS, users);
  return { data: newUser };
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<{ data: User }> => {
  const users = await getData<User[]>(STORAGE_KEYS.USERS) || [];
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  users[userIndex] = { ...users[userIndex], ...userData };
  await storeData(STORAGE_KEYS.USERS, users);
  return { data: users[userIndex] };
};

// Sellers
export const getSellers = async (): Promise<{ data: Seller[] }> => {
  const sellers = await getData<Seller[]>(STORAGE_KEYS.SELLERS) || [];
  return { data: sellers };
};

export const getSellerById = async (id: string): Promise<{ data: Seller }> => {
  const sellers = await getData<Seller[]>(STORAGE_KEYS.SELLERS) || [];
  const seller = sellers.find(s => s.id === id);
  if (!seller) {
    throw new Error('Seller not found');
  }
  return { data: seller };
};

// Reviews
export const getProductReviews = async (productId: string, page: number = 1, limit: number = 10): Promise<{ data: Review[]; pagination: any }> => {
  const reviews = await getData<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  const productReviews = reviews.filter(r => r.productId === productId);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReviews = productReviews.slice(startIndex, endIndex);
  
  return {
    data: paginatedReviews,
    pagination: {
      page,
      limit,
      total: productReviews.length,
      totalPages: Math.ceil(productReviews.length / limit),
      hasNext: endIndex < productReviews.length,
      hasPrev: page > 1,
    }
  };
};

// Stories
export const getStories = async (): Promise<{ data: Story[] }> => {
  const stories = await getData<Story[]>(STORAGE_KEYS.STORIES) || [];
  return { data: stories };
};

// Orders
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Order }> => {
  const orders = await getData<Order[]>(STORAGE_KEYS.ORDERS) || [];
  const newOrder: Order = {
    ...orderData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  orders.push(newOrder);
  await storeData(STORAGE_KEYS.ORDERS, orders);
  return { data: newOrder };
};

export const getUserOrders = async (userId: string): Promise<{ data: Order[] }> => {
  const orders = await getData<Order[]>(STORAGE_KEYS.ORDERS) || [];
  const userOrders = orders.filter(o => o.userId === userId);
  return { data: userOrders };
};

// Notifications
export const getUserNotifications = async (userId: string): Promise<{ data: Notification[] }> => {
  const notifications = await getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  const userNotifications = notifications.filter(n => n.userId === userId);
  return { data: userNotifications };
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const notifications = await getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex !== -1) {
    notifications[notificationIndex].isRead = true;
    await storeData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  const notifications = await getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
  const userNotifications = notifications.map(n => 
    n.userId === userId ? { ...n, isRead: true } : n
  );
  await storeData(STORAGE_KEYS.NOTIFICATIONS, userNotifications);
};

// Cart
export const getCart = async (userId: string): Promise<{ data: CartItem[] }> => {
  const cart = await getData<CartItem[]>(STORAGE_KEYS.CART) || [];
  const userCart = cart.filter(item => item.userId === userId);
  return { data: userCart };
};

export const addToCart = async (userId: string, product: Product, quantity: number = 1, selectedSize?: string, selectedColor?: any): Promise<void> => {
  const cart = await getData<CartItem[]>(STORAGE_KEYS.CART) || [];
  const existingItem = cart.find(item => item.userId === userId && item.product.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: Date.now().toString(),
      userId,
      product,
      quantity,
      selectedSize,
      selectedColor,
      price: product.price,
    });
  }
  
  await storeData(STORAGE_KEYS.CART, cart);
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<void> => {
  const cart = await getData<CartItem[]>(STORAGE_KEYS.CART) || [];
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    await storeData(STORAGE_KEYS.CART, cart);
  }
};

export const removeFromCart = async (itemId: string): Promise<void> => {
  const cart = await getData<CartItem[]>(STORAGE_KEYS.CART) || [];
  const filteredCart = cart.filter(item => item.id !== itemId);
  await storeData(STORAGE_KEYS.CART, filteredCart);
};

export const clearCart = async (userId: string): Promise<void> => {
  const cart = await getData<CartItem[]>(STORAGE_KEYS.CART) || [];
  const filteredCart = cart.filter(item => item.userId !== userId);
  await storeData(STORAGE_KEYS.CART, filteredCart);
};

// Wishlist
export const getWishlist = async (userId: string): Promise<{ data: Product[] }> => {
  const wishlist = await getData<string[]>(`${STORAGE_KEYS.WISHLIST}_${userId}`) || [];
  const products = await getData<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  return { data: wishlistProducts };
};

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  const wishlist = await getData<string[]>(`${STORAGE_KEYS.WISHLIST}_${userId}`) || [];
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    await storeData(`${STORAGE_KEYS.WISHLIST}_${userId}`, wishlist);
  }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  const wishlist = await getData<string[]>(`${STORAGE_KEYS.WISHLIST}_${userId}`) || [];
  const filteredWishlist = wishlist.filter(id => id !== productId);
  await storeData(`${STORAGE_KEYS.WISHLIST}_${userId}`, filteredWishlist);
};

// Notification functions
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  // Return empty array instead of mock notifications
  const notifications = await getData<Notification[]>(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`) || [];
  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Original code (commented out for testing):
  // const { mockNotifications } = await import('./mockData');
  // Return all mock notifications regardless of userId for testing
  // return mockNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Original code (commented out for testing):
  // const notifications = await getData<Notification[]>(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`) || [];
  // return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
  const notifications = await getData<Notification[]>(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`) || [];
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, isRead: true }
      : notification
  );
  await storeData(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`, updatedNotifications);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const notifications = await getData<Notification[]>(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`) || [];
  const updatedNotifications = notifications.map(notification => ({ ...notification, isRead: true }));
  await storeData(`${STORAGE_KEYS.NOTIFICATIONS}_${userId}`, updatedNotifications);
};

// Order functions
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const orders = await getData<Order[]>(STORAGE_KEYS.ORDERS) || [];
  return orders.find(order => order.id === orderId) || null;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const orders = await getData<Order[]>(STORAGE_KEYS.ORDERS) || [];
  return orders.filter(order => order.userId === userId);
};

// Review functions
export const addReview = async (review: Review): Promise<void> => {
  const reviews = await getData<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  reviews.push(review);
  await storeData(STORAGE_KEYS.REVIEWS, reviews);
};