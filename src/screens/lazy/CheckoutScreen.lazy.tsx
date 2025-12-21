import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the CheckoutScreen component
const LazyCheckoutScreen = lazy(() => import('../main/profileScreen/CheckoutScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const CheckoutScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading checkout..." />}>
    <LazyCheckoutScreen {...props} />
  </Suspense>
);

export default CheckoutScreenWithSuspense;
