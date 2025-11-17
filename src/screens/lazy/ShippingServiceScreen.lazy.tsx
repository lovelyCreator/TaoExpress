import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ShippingServiceScreen component
const LazyShippingServiceScreen = lazy(() => import('../main/ShippingServiceScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ShippingServiceScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading shipping service..." />}>
    <LazyShippingServiceScreen {...props} />
  </Suspense>
);

export default ShippingServiceScreenWithSuspense;
