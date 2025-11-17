import { Order } from '../types';

// Mock order detail data
export const mockOrderDetail = {
  id: '1',
  orderNumber: 'GLM-2023-001',
  storeName: 'Fashion Store',
  status: 'Sent' as const,
  items: [
    {
      id: '1',
      brand: 'Nike',
      productName: 'Air Max 270',
      size: 'US 9',
      variant: 'Black/White',
      originalPrice: 150.00,
      currentPrice: 120.00,
      discount: 20,
      image: require('../../assets/images/product1.jpg'),
    },
    {
      id: '2',
      brand: 'Adidas',
      productName: 'Ultraboost 22',
      size: 'US 10',
      variant: 'Blue',
      originalPrice: 180.00,
      currentPrice: 160.00,
      discount: 11,
      image: require('../../assets/images/product2.jpg'),
    },
  ],
  customerName: 'John Doe',
  customerPhone: '+1 234 567 8900',
  customerAddress: '123 Main St, New York, NY 10001',
  subtotal: 280.00,
  delivery: 15.00,
  discount: 25.00,
  total: 270.00,
  dateOrder: 'Oct 15, 2023',
  airwaybill: 'AWB-1234567890',
};

// Function to get detailed order by ID
export const getDetailedOrderById = (orderId: string) => {
  // In a real app, this would fetch from an API
  // For now, we'll just return the mock data if the ID matches
  if (orderId === '1') {
    return mockOrderDetail;
  }
  return null;
};