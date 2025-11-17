import { CheckoutOrderParams } from './types';

// Test that the interface includes addressId
const testParams: CheckoutOrderParams = {
  orderAmount: 100,
  cartIds: [1, 2, 3],
  addressId: 1
};

console.log(testParams);